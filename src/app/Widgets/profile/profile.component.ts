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
export class ProfileComponent implements OnDestroy {
  /**
   * Form User
   */
  formUser: FormGroup;

  /**
   * Userid signal
   */
  private userid = signal<number>(0);

  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * Roles
   */
  roles = signal<string[]>([]);

  /**
   * Theme mode
   */
  isDarkMode = signal(false); // Default to light theme

  /**
   * Constructor
   * @param userService user service
   * @param authService auth service
   * @param fb form builder
   * @param utils utility service
   * @param cdRef Change detector Reference
   */
  constructor(
    private userService: UsersService,
    private authService: AuthService,
    private fb: FormBuilder,
    private utils: UtilitiesService,
    private cdRef: ChangeDetectorRef
  ) {
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
    this.userid.set(Number(this.authService.getUserID()));
    this.getLoggedinUser();
    this.getRoles();

    if (authService.getUserTheme() === 'dark') {
      this.isDarkMode.set(true);
    }
  }

  /**
   * This method for toggle theme dark or light
   * @param event event
   */
  toggleTheme(event: Event) {
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
  getLoggedinUser(): void {
    this.userService.getUserByID(this.userid().toString());
    this.subscriptionList.push(
      this.userService.user$.subscribe({
        next: (res: any) => {
          if (res.length !== 0) {
            this.formUser.patchValue(res[0]);
            // this.username = res[0].username;
            // this.userid = res[0].userid;
            // if (res[0].role == ROLES.ADMIN || res[0].role == ROLES.MANAGER) {
            if (res[0].role == ROLES.ADMIN) {
              this.formUser.get('role')?.enable();
            }
          }
        },
        error: (err: any) => {
          console.log(err.message);
        },
      })
    );
  }

  /**
   * This This method to update the user profile form
   */
  saveForm(): void {
    this.subscriptionList.push(
      this.userService
        .updateUserByID(
          this.userid(),
          this.formUser.value.name,
          this.formUser.value.mobile,
          this.formUser.value.company,
          this.formUser.value.designation,
          this.formUser.value.imagepath,
          this.formUser.value.role
        )
        .subscribe({
          next: (data) => {
            this.utils.showToast('User saved successfully', 'success');
            this.userService.getUserByIDMust(this.userid().toString());
          },
          error: (err) => {
            this.utils.showToast(err.message, 'error');
          },
        })
    );
  }

  /**
   * This method to reset the user profile form
   */
  formReset(): void {
    this.getLoggedinUser();
  }

  /**
   * This method will open user profile as popup
   */
  openModal(): void {
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
   * This method will fetch all the user roles
   */
  getRoles(): void {
    this.roles.set(this.utils.roles());
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
