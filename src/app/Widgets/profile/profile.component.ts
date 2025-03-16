import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
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
import { AuthService } from '../../Services/auth.service';
import { UtilitiesService } from '../../Services/utilities.service';
import { ROLES } from '../../Models/Constants';
declare var bootstrap: any;
@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, ToastComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {
  /**
   * Injection
   */

  private utils = inject(UtilitiesService);
  private userService = inject(UsersService);
  private authService = inject(AuthService);
  /**
   * Form User
   */
  formUser: FormGroup;

  /**
   * Form Password
   */
  formPassword: FormGroup;
  /**
   * User signal
   */
  user = this.userService.user;

  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * Roles
   */
  roles = signal<string[]>(this.utils.roles());

  /**
   * Theme mode
   */
  isDarkMode = signal(false); // Default to light theme

  /**
   * Constructor
   * @param fb form builder
   * @param cdRef Change detector Reference
   */
  constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef) {
    this.formUser = this.fb.group({
      userid: [{ value: 0, disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, Validators.required],
      username: [{ value: '', disabled: true }, Validators.required],
      name: [''],
      mobile: [],
      company: [''],
      designation: [''],
      imagepath: [''],
      role: [{ value: '', disabled: true }, Validators.required],
    });

    this.formPassword = this.fb.group({
      oldpassword: ['', [Validators.required]],
      newpassword: ['', [Validators.required, Validators.minLength(8)]],
    });

    if (this.authService.getUserTheme() === 'dark') {
      this.isDarkMode.set(true);
    }
  }

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.getLoggedinUser();
  }

  /**
   * This method for toggle theme dark or light
   * @param event event
   */
  public toggleTheme(event: Event) {
    this.isDarkMode.set((event.target as HTMLInputElement).checked);
    document.documentElement.setAttribute(
      'data-bs-theme',
      this.isDarkMode() ? 'dark' : 'light'
    );
    if (this.isDarkMode()) {
      this.authService.storeUserTheme('dark');
    } else {
      this.authService.storeUserTheme('light');
    }
  }

  /**
   * This method to get the user profile info from database
   */
  private getLoggedinUser(): void {
    this.formUser.patchValue(this.user());
    if (this.user().role == ROLES.ADMIN) {
      this.formUser.get('role')?.enable();
    }
  }

  /**
   * This This method to update the user profile form
   */
  public saveForm(): void {
    this.subscriptionList.push(
      this.userService
        .updateUserByID(
          this.user().userid,
          this.formUser.getRawValue().name,
          this.formUser.getRawValue().mobile,
          this.formUser.getRawValue().company,
          this.formUser.getRawValue().designation,
          this.formUser.getRawValue().imagepath,
          this.formUser.getRawValue().role
        )
        .subscribe({
          next: (data) => {
            this.utils.showToast('User saved successfully', 'success');
            this.userService.refreshUser();
          },
          error: (err) => {
            this.utils.showToast(err.message, 'error');
          },
        })
    );
  }

  /**
   * This method will fetch form control
   */
  public get oldpassword() {
    return this.formPassword.get('oldpassword');
  }

  /**
   * This method will fetch form control
   */
  public get newpassword() {
    return this.formPassword.get('newpassword');
  }

  /**
   * This method will update password
   * @param oldpassword {string} user old password
   * @param newpassword {string} user new password
   */
  public resetPassword(oldpassword: string, newpassword: string): void {
    this.subscriptionList.push(
      this.userService
        .resetUserPasswordByID(oldpassword, newpassword)
        .subscribe({
          next: (res: any) => {
            this.utils.showToast('Password Update Successfully', 'success');
          },
          error: (err: any) => {
            this.utils.showToast(err.message, 'error');
          },
        })
    );
  }

  /**
   * This method to reset the user profile form
   */
  public formReset(): void {
    this.getLoggedinUser();
  }
  /**
   * This method to reset the user profile password form
   */
  public formResetPassword(): void {
    this.formPassword.reset();
  }

  /**
   * This method will open user profile as popup
   */
  public openModal(): void {
    this.formReset();
    const modalElement = document.getElementById('userprofile');
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
  public ngOnDestroy(): void {
    this.subscriptionList.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });
  }
}
