import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastComponent } from '../toast/toast.component';
import { UsersService } from '../../Services/users.service';
import { UtilitiesService } from '../../Services/utilities.service';
declare var bootstrap: any;

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, ToastComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent implements OnDestroy {
  /**
   * Form Signup
   */
  formSignUp: FormGroup;
  /**
   * Roles
   */
  roles = signal<string[]>([]);
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * Constructor
   * @param fb form builder
   * @param userService user service
   * @param utils utility service
   * @param cdRef Change detector Reference
   */
  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private utils: UtilitiesService,
    private cdRef: ChangeDetectorRef
  ) {
    this.formSignUp = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      name: ['', Validators.required],
      mobile: [''],
      company: [''],
      designation: [''],
      imagepath: [''],
      role: ['', Validators.required],
    });
    this.getRoles();
  }

  /**
   * This method for get roles
   */
  getRoles() {
    this.roles.set(this.utils.roles());
  }

  /**
   * This method for SignUp user
   */
  onSignUp(): void {
    this.subscriptionList.push(
      this.userService.createUser(this.formSignUp.value).subscribe({
        next: (data) => {
          this.utils.showToast(data.message, 'success');
          this.formReset();
        },
        error: (err) => {
          this.utils.showToast(err.message, 'error');
        },
      })
    );
  }

  /**
   * This method will reset the form value to blank
   */
  formReset(): void {
    this.formSignUp.reset();
  }

  /**
   * This method for open modal
   */
  openModal(): void {
    this.formReset();
    const modalElement = document.getElementById('signupModel');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    } else {
      console.error('Modal element not found');
    }
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
