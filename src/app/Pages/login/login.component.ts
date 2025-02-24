import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { UtilitiesService } from '../../Services/utilities.service';
import { AuthService } from '../../Services/auth.service';
import { ROLES } from '../../Models/Constants';
import { environment } from '../../../environments/environment';
import {
  RECAPTCHA_SETTINGS,
  RecaptchaComponent,
  RecaptchaModule,
  RecaptchaSettings,
} from 'ng-recaptcha-2';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ToastComponent, RecaptchaModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: environment.recaptchaSiteKey, // Provide the site key dynamically
      } as RecaptchaSettings,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private utils = inject(UtilitiesService);
  @ViewChild(RecaptchaComponent) recaptcha!: RecaptchaComponent; // Get reCAPTCHA reference
  formLogin: FormGroup;
  subscriptionList: Subscription[] = [];
  siteKey = signal<string>(environment.recaptchaSiteKey);

  /**
   * Constructor
   * @param router Router for page route
   * @param fb Form Builder
   */
  constructor(private router: Router, private fb: FormBuilder) {
    this.formLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      //captchaAnswer: ['', Validators.required],
      recaptcha: ['', Validators.required],
    });
    if (!environment.production) {
      this.formLogin.patchValue({ recaptcha: 'bypass-response' });
    }
    // this.generateCaptcha();
  }
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Welcome Consult & Train');
  }

  /**
   * This method will fetch userid & password and captcha and validate login
   */
  onLogin() {
    if (environment)
      this.subscriptionList.push(
        this.authService
          .login(
            this.formLogin.value.email,
            this.formLogin.value.password,
            this.formLogin.value.recaptcha
          )
          .subscribe({
            next: (data) => {
              if (data.role == ROLES.GUEST) {
                this.router.navigateByUrl('gdashboard');
              } else {
                this.router.navigateByUrl('dashboard');
              }
              this.utils.showToast('Successfull Logged-in', 'success');
            },
            error: (err: any) => {
              // console.log(err.message);
              this.utils.showToast(err.message, 'error');
              this.recaptcha.reset();
            },
          })
      );
  }

  /**
   * This method will update captcha response into reactive form
   * @param response captcha response
   */
  onCaptchaResolved(response: string | null): void {
    // console.log('CAPTCHA resolved with response:', response);
    this.formLogin.patchValue({ recaptcha: response });
  }

  /**
   * This method will reset the form value to blank
   */
  formReset(): void {
    this.formLogin.reset();
  }

  /**
   * This method will destory all the subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptionList.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });
  }
}
