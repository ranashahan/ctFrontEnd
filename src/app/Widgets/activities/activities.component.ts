import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { apiActivityModel } from '../../Models/Activity';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivityService } from '../../Services/activity.service';
import { UtilitiesService } from '../../Services/utilities.service';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-activities',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  /**
   * Selected category Signal
   */
  selectedCategoryId = signal<number>(0);
  /**
   * Activity Signal
   */
  activities = signal<apiActivityModel[]>([]);
  /**
   * Secondary Signal
   */
  scondaryCategories = signal<apiActivityModel[]>([]);

  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * activity form
   */
  formActivity = new FormGroup({
    name: new FormControl(),
    description: new FormControl(),
    initials: new FormControl(),
    orderid: new FormControl(),
    slavecategoryid: new FormControl(),
  });

  /**
   * Constructor
   * @param activityService activity service
   * @param utils utility service
   * @param toastService toast message service
   * @param cdRef Change detector Reference
   */
  constructor(
    private activityService: ActivityService,
    private utils: UtilitiesService,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.getSlaveCategories();
  }

  /**
   * This method will fetch scondary categoriesand load data against it
   */
  getSlaveCategories() {
    this.subscriptionList.push(
      this.activityService.getAllSlaveCategories().subscribe((res: any) => {
        this.scondaryCategories.set(res);
        this.utils.showToast(
          'Secondary Categories loaded successfully',
          'info'
        );
        const categories = this.scondaryCategories();
        if (categories && categories.length > 0) {
          this.selectedCategoryId.set(categories[0].id); // Set the default to the first category's ID
        }
        this.getByScondaryID(this.selectedCategoryId());
      })
    );
  }

  /**
   * This method will fetch activities against secondary category id
   * @param id number secondary category id
   */
  getByScondaryID(id: number) {
    this.subscriptionList.push(
      this.activityService.getActivityBySlaveID(id).subscribe((res: any) => {
        this.activities.set(res);
        this.utils.showToast(
          'Activities has been loaded against secondary category',
          'info'
        );
      })
    );
  }

  /**
   * This method will convert scondary category id into name
   * @param slavecategoryid number secondary category id
   * @returns string name
   */
  getSlaveCategoryName(slavecategoryid: number): string {
    const foundCategory = this.scondaryCategories().find(
      (category) => category.id === slavecategoryid
    );
    return foundCategory ? foundCategory.name : '';
  }

  /**
   * This method will create new activity
   * @param name string activity name
   * @param description string activity description
   * @param initials string activity initials
   * @param initials {number} activity orderid
   * @param slavecategoryid number scondary category id
   */
  create(
    name: string,
    description: string,
    initials: string,
    orderid: number,
    slavecategoryid: number
  ) {
    this.subscriptionList.push(
      this.activityService
        .createActivity(name, description, initials, orderid, slavecategoryid)
        .subscribe({
          next: (res: any) => {
            this.utils.showToast(res.message, 'success');
          },
          error: (err: any) => {
            const errorMessage = err?.message || 'An unexpected error occurred';
            this.utils.showToast(errorMessage, 'error'); // Show error toast
          },
        })
    );
  }

  /**
   * This method will update category against id
   * @param id number category id
   * @param name string category name
   * @param description string category description
   * @param initials string category initials
   * @param orderid number category orderid
   * @param slavecategoryid number scondary category id
   */
  update(
    id: number,
    name: string,
    description: string,
    initials: string,
    orderid: number,
    slavecategoryid: number
  ) {
    this.subscriptionList.push(
      this.activityService
        .updateActivity(
          id,
          name,
          description,
          initials,
          orderid,
          slavecategoryid
        )
        .subscribe((res: any) => {
          this.utils.showToast('Activity Updated Successfully', 'success');
        })
    );
  }

  /**
   * This method will deactivate activity
   * @param id number
   */
  async deleteActivity(id: number) {
    const isConfirmed = confirm(
      'Are you sure you want to delete this activity: ' + id
    );
    if (isConfirmed) {
      this.subscriptionList.push(
        this.activityService.deleteActivity(id).subscribe((res: any) => {
          this.utils.showToast(
            'Activity has been deleted successfully',
            'success'
          );
          this.activities.update((activity) =>
            activity.filter((act) => act.id !== id)
          );
        })
      );
    }
  }

  /**
   * This method will enable editalble fields.
   * @param item activity
   */
  onEdit(item: any) {
    this.activities().forEach((element: apiActivityModel) => {
      element.isEdit = false;
    });
    item.isEdit = true;
  }

  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('activity-table', 'Consult-Activity-export');
  }

  /**
   * This method to reset the user profile form
   */
  formReset() {
    this.formActivity.reset();
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
