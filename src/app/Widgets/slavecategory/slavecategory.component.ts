import { CommonModule } from '@angular/common';
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
import {
  apiMasterCategoryModel,
  apiSlaveCategoryModel,
} from '../../Models/Category';
import { Subscription } from 'rxjs';
import { ActivityService } from '../../Services/activity.service';
import { UtilitiesService } from '../../Services/utilities.service';

@Component({
  selector: 'app-slavecategory',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, ToastComponent],
  templateUrl: './slavecategory.component.html',
  styleUrl: './slavecategory.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlavecategoryComponent implements OnInit, OnDestroy {
  /**
   * Primary Category Signal
   */
  primaryCategories = signal<apiMasterCategoryModel[]>([]);
  /**
   * Secondary Category Signal
   */
  secondaryCategories = signal<apiSlaveCategoryModel[]>([]);

  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * Slave category form
   */
  formSecondaryCategory = new FormGroup({
    name: new FormControl(),
    description: new FormControl(),
    initials: new FormControl(),
    orderid: new FormControl(),
    mastercategoryid: new FormControl(),
  });

  /**
   * Constructor
   * @param activityService activity service
   * @param utils utility service
   * @param toastService toast message service
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
    this.getAll();
    this.getAllPrimary();
  }

  /**
   * This method will fetch all the master category from database
   */
  getAllPrimary(): void {
    this.subscriptionList.push(
      this.activityService.getMasterCategoriesAll().subscribe((res: any) => {
        this.primaryCategories.set(res);
      })
    );
  }

  /**
   * This method will fetch master category name against its ID
   * @param mastercategoryid number master category Id
   * @returns string mastercategory name
   */
  getMasterCategoryName(mastercategoryid: number): string {
    const foundCategory = this.primaryCategories().find(
      (category) => category.id === mastercategoryid
    );
    return foundCategory ? foundCategory.name : '';
  }

  /**
   * This method will fetch all the records from database.
   */
  getAll(): void {
    this.subscriptionList.push(
      this.activityService.getSlaveCategoriesAll().subscribe((res: any) => {
        this.secondaryCategories.set(res);
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
   * @param mastercategoryid number master category Id
   */
  update(
    id: number,
    name: string,
    description: string,
    initials: string,
    orderid: number,
    mastercategoryid: number
  ): void {
    this.subscriptionList.push(
      this.activityService
        .updateSlaveCategory(
          id,
          name,
          description,
          initials,
          orderid,
          mastercategoryid
        )
        .subscribe((res: any) => {
          this.utils.showToast(
            'Secondary category updated successfully',
            'success'
          );
        })
    );
  }

  /**
   * This method will create new primary category
   * @param name string category name
   * @param description string category description
   * @param initials string category initials
   * @param orderid number category orderid
   * @param mastercategoryid number master category Id
   */
  create(
    name: string,
    description: string,
    initials: string,
    orderid: number,
    mastercategoryid: number
  ): void {
    this.subscriptionList.push(
      this.activityService
        .createSlaveCategory(
          name,
          description,
          initials,
          orderid,
          mastercategoryid
        )
        .subscribe({
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
   * This method will deactivate secondary category
   * @param id number
   */
  async delete(id: number) {
    const isConfirmed = confirm(
      'Are you sure you want to delete this secondary category: ' + id
    );

    if (isConfirmed) {
      this.subscriptionList.push(
        this.activityService.deleteSlaveCategory(id).subscribe({
          next: (data) => {
            this.utils.showToast(
              'Secondary Category has been deleted successfully',
              'success'
            );
            this.secondaryCategories.update((activity) =>
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
   * @param item slavecategory
   */
  onEdit(item: any): void {
    this.secondaryCategories().forEach((element: apiSlaveCategoryModel) => {
      element.isEdit = false;
    });
    item.isEdit = true;
  }

  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel(
      'secondarycategory-table',
      'Consult-SecondaryCategory-export'
    );
  }

  /**
   * This method to reset the user profile form
   */
  formReset() {
    this.formSecondaryCategory.reset();
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
