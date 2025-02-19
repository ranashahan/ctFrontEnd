import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastComponent } from '../toast/toast.component';
import { CommonModule } from '@angular/common';
import { apiSuperCategoryModel } from '../../Models/Category';
import { Subscription } from 'rxjs';
import { UtilitiesService } from '../../Services/utilities.service';
import { ActivityService } from '../../Services/activity.service';

@Component({
  selector: 'app-supercategory',
  imports: [ReactiveFormsModule, ToastComponent, CommonModule, FormsModule],
  templateUrl: './supercategory.component.html',
  styleUrl: './supercategory.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupercategoryComponent implements OnInit, OnDestroy {
  /**
   * Primary category Signal
   */
  superCategories = signal<apiSuperCategoryModel[]>([]);

  /**
   * Primary category form
   */
  formSuperCategory = new FormGroup({
    name: new FormControl(),
    description: new FormControl(),
  });

  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * Constructor
   * @param utils utilities service for set page title
   * @param activityService activity service for category
   * @param cdRef Change detector Reference
   */
  constructor(
    private utils: UtilitiesService,
    private activityService: ActivityService,
    private cdRef: ChangeDetectorRef
  ) {}
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.getAll();
  }
  /**
   * This method will fetch all the records from database.
   */
  getAll(): void {
    this.subscriptionList.push(
      this.activityService.getSuperCategoriesAll().subscribe((res: any) => {
        this.superCategories.set(res);
      })
    );
  }

  /**
   * This method will update category against id
   * @param id number category id
   * @param name string category name
   * @param description string category description
   */
  update(id: number, name: string, description: string) {
    this.subscriptionList.push(
      this.activityService
        .updateSuperCategory(id, name, description)
        .subscribe({
          next: (res: any) => {
            this.utils.showToast('Form Updated Successfully', 'success');
          },
          error: (err: any) => {
            const errorMessage = err?.message || 'An unexpected error occurred';
            this.utils.showToast(errorMessage, 'error');
          },
        })
    );
  }

  /**
   * This method will create new primary category
   * @param name string category name
   * @param description string category description
   */
  create(name: string, description: string) {
    this.subscriptionList.push(
      this.activityService.createSuperCategory(name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast(res.message, 'success');
          this.getAll();
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error');
        },
      })
    );
  }

  /**
   * This method will deactivate primary category
   * @param id number
   */
  async delete(id: number) {
    const isConfirmed = confirm(
      'Are you sure you want to delete this primary category: ' + id
    );
    if (isConfirmed) {
      this.subscriptionList.push(
        this.activityService.deleteSuperCategory(id).subscribe({
          next: (data) => {
            this.utils.showToast(
              'Primary Category has been deleted successfully',
              'success'
            );
            this.superCategories.update((activity) =>
              activity.filter((act) => act.id !== id)
            );
          },
          error: (err) => {
            this.utils.showToast(err.message, 'error');
          },
        })
      );
    }
  }

  /**
   * This method will enable editalble fields.
   * @param item primarycategory
   */
  onEdit(item: any) {
    this.superCategories().forEach((element: apiSuperCategoryModel) => {
      element.isEdit = false;
    });
    item.isEdit = true;
  }
  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel(
      'primarycategory-table',
      'Consult-PrimaryCategory-export'
    );
  }
  /**
   * This method to reset the user profile form
   */
  formReset() {
    this.formSuperCategory.reset();
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
