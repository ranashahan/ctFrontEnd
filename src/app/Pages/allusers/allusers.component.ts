import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SignupComponent } from '../../Widgets/signup/signup.component';
import { DeleteConfirmationComponent } from '../../Widgets/delete-confirmation/delete-confirmation.component';
import { apiUserModel } from '../../Models/User';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UtilitiesService } from '../../Services/utilities.service';
import { UsersService } from '../../Services/users.service';
declare var bootstrap: any;
@Component({
  selector: 'app-allusers',
  imports: [
    ToastComponent,
    SignupComponent,
    RouterOutlet,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DeleteConfirmationComponent,
  ],
  templateUrl: './allusers.component.html',
  styleUrl: './allusers.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllusersComponent implements OnInit, OnDestroy {
  @ViewChild(SignupComponent) signupComponent!: SignupComponent;
  @ViewChild(DeleteConfirmationComponent)
  deleteConfirmation!: DeleteConfirmationComponent;
  private userService = inject(UsersService);
  private utils = inject(UtilitiesService);
  employees = this.userService.users;
  roles = signal<string[]>(this.utils.roles());
  formPassword: FormGroup;

  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * Constructor
   * @param cdRef change detection
   * @param fb form builder
   */
  constructor(private cdRef: ChangeDetectorRef, private fb: FormBuilder) {
    this.formPassword = this.fb.group({
      id: [{ value: 0 }],
      newpassword: [
        { value: '' },
        [Validators.required, Validators.minLength(8)],
      ],
    });
  }

  /**
   * This will fetch form password field
   */
  get newpassword() {
    return this.formPassword.get('newpassword');
  }

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('All Employees');
  }

  /**
   * This method will update user password against id
   * @param id {number} user id
   * @param password {string} new password
   */
  updatePassword(id: number, password: string) {
    this.subscriptionList.push(
      this.userService
        .updateUserPasswordByID(id, password)
        .subscribe((res: any) => {
          this.utils.showToast('Password saved successfully', 'success');
          this.userService.refreshUsers();
        })
    );
  }

  /**
   * This method will update the user
   * @param id number userid
   * @param name string name
   * @param mobile string mobile
   * @param company string company
   * @param designation string designation
   * @param role string user role
   */
  updateUser(
    id: number,
    name: string,
    mobile: string,
    company: string,
    designation: string,
    role: string
  ) {
    this.subscriptionList.push(
      this.userService
        .updateUserByID(id, name, mobile, company, designation, '', role)
        .subscribe((res: any) => {
          this.utils.showToast('User updated successfully', 'success');
          this.userService.refreshUsers();
        })
    );
  }

  /**
   * This method will deactivate user
   * @param id number
   */
  async deleteUser(id: number) {
    const isConfirmed = await this.deleteConfirmation.openModal(
      'Employee: ' + id
    );
    if (isConfirmed) {
      this.subscriptionList.push(
        this.userService.deleteUser(id).subscribe((res: any) => {
          this.utils.showToast('User deleted successfully', 'success');
          this.userService.refreshUsers();
        })
      );
    }
  }

  /**
   * This method will open signup modal
   */
  openSignUpModal() {
    this.signupComponent.openModal();
  }

  /**
   * This method will open the new password modal
   * @param id number userid
   */
  openModal(id: number) {
    this.formRest();
    this.formPassword.patchValue({ id });
    const myModal = document.getElementById('employeePassword');
    if (myModal) {
      const modalInstance = new bootstrap.Modal(myModal);
      modalInstance.show();
    }
  }

  /**
   * This method will enable editalble fields.
   * @param item user
   */
  onEdit(item: any) {
    this.employees().forEach((element: apiUserModel) => {
      element.isEdit = false;
    });
    item.isEdit = true;
  }

  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('alluser-table', 'Consult-allusers-export');
  }

  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formPassword.reset();
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
