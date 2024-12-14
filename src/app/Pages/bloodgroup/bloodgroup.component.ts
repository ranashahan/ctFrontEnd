import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { apiGenericModel } from '../../Models/Generic';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BloodgroupService } from '../../Services/bloodgroup.service';
import { UtilitiesService } from '../../Services/utilities.service';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../../Widgets/toast/toast.component';

@Component({
  selector: 'app-bloodgroup',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, ToastComponent],
  templateUrl: './bloodgroup.component.html',
  styleUrl: './bloodgroup.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BloodgroupComponent implements OnInit, OnDestroy {
  private bgService = inject(BloodgroupService);
  private utils = inject(UtilitiesService);

  /**
   * blood group signal
   */
  bloodgroups = this.bgService.bloodGroups;
  /**
   * Form for creating new blood group
   */
  formSaveBg = new FormGroup({
    name: new FormControl(),
    description: new FormControl(),
  });
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Blood Groups');
  }

  /**
   * This method will update blood group against id
   * @param id {number} blood group id
   * @param name {string} blood group name
   * @param description {string} blood group description
   */
  update(id: number, name: string, description: string) {
    this.subscriptionList.push(
      this.bgService.updateBloodGroup(id, name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast('Blood group updated successfully.', 'success');
          this.bgService.refreshBloodGroups();
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error'); // Show error toast
        },
      })
    );
  }
  /**
   * This method will create new blood group
   * @param name {string} blood group name
   * @param description {string} blood group description
   */
  create(name: string, description: string) {
    this.subscriptionList.push(
      this.bgService.createBloodGroup(name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast(res.message, 'success');
          this.bgService.refreshBloodGroups();
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error'); // Show error toast
        },
      })
    );
  }
  /**
   * This method will enable editalble fields.
   * @param blood blood group
   */
  onEdit(blood: any) {
    this.bloodgroups().forEach((element: apiGenericModel) => {
      element.isEdit = false;
    });
    blood.isEdit = true;
  }
  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('blood-table', 'Consult-bloodGroups-export');
  }
  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formSaveBg.reset();
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
