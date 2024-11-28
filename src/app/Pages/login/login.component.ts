import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
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

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ToastComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  formLogin: FormGroup;
  subscriptionList: Subscription[] = [];
  captchaQuestion: string = '';
  correctAnswer: number = 0;

  /**
   * Constructor
   * @param router Router for page route
   * @param utils utility service
   * @param fb Form Builder
   * @param authService auth service
   */
  constructor(
    private router: Router,
    private utils: UtilitiesService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.formLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      captchaAnswer: ['', Validators.required],
    });
    this.generateCaptcha();
  }
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Welcome Consult & Train');
  }

  /**
   * Login method
   */
  onLogin() {
    const userAnswer = parseInt(
      this.formLogin.get('captchaAnswer')?.value || '0',
      10
    );
    if (this.formLogin.valid && userAnswer === this.correctAnswer) {
      this.subscriptionList.push(
        this.authService
          .login(
            this.formLogin.value.email ?? 'empty',
            this.formLogin.value.password ?? 'empty'
          )
          .subscribe({
            next: (data) => {
              this.utils.showToast('Successfull Logged-in', 'success');
              if (data.role == ROLES.GUEST) {
                this.router.navigateByUrl('gdashboard');
              } else {
                this.router.navigateByUrl('dashboard');
              }
            },
            error: (err) => {
              this.utils.showToast(err.message, 'error');
            },
          })
      );
    } else {
      this.utils.showToast(
        'Incorrect CAPTCHA answer. Please try again.',
        'error'
      );
      this.generateCaptcha();
    }
  }

  /**
   * This method will create captcha
   */
  generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    this.correctAnswer = num1 + num2;
    this.captchaQuestion = `${num1} + ${num2} = ?`;
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
