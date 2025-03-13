import { Component, inject } from '@angular/core';
import { CategoryService } from '../../Services/category.service';
import { UtilitiesService } from '../../Services/utilities.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { apiGenericModel } from '../../Models/Generic';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../../Widgets/toast/toast.component';

@Component({
  selector: 'app-category',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent {
  private categoryService = inject(CategoryService);
  private utils = inject(UtilitiesService);
  /**
   * category signal
   */
  categories = this.categoryService.categories;
  /**
   * Form for creating new category
   */
  formSaveCategory = new FormGroup({
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
    this.utils.setTitle('Categories');
  }

  /**
   * This method will update category against id
   * @param id {number} category id
   * @param name {string} category name
   * @param description {string} category description
   */
  updateCategory(id: number, name: string, description: string) {
    this.subscriptionList.push(
      this.categoryService.updateCategory(id, name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast('category updated successfully.', 'success');
          this.categoryService.refreshCategories();
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error'); // Show error toast
        },
      })
    );
  }
  /**
   * This method will create new category
   * @param name {string} category name
   * @param description {string} category description
   */
  createCategory(name: string, description: string) {
    this.subscriptionList.push(
      this.categoryService.createCategory(name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast(res.message, 'success');
          this.categoryService.refreshCategories();
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
   * @param category category
   */
  onEdit(category: any) {
    this.categories().forEach((element: apiGenericModel) => {
      element.isEdit = false;
    });
    category.isEdit = true;
  }
  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('category-table', 'Consult-categories-export');
  }
  /**
   * This method will reset the form value to blank
   */
  formReset() {
    this.formSaveCategory.reset();
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
