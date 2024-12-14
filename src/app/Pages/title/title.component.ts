import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
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
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { Subscription } from 'rxjs';
import { apiGenericModel } from '../../Models/Generic';
import { UtilitiesService } from '../../Services/utilities.service';
import { TitleService } from '../../Services/title.service';

@Component({
  selector: 'app-title',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, ToastComponent],
  templateUrl: './title.component.html',
  styleUrl: './title.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleComponent implements OnInit, OnDestroy {
  private titleService = inject(TitleService);
  private utils = inject(UtilitiesService);
  /**
   * title Signal
   */
  titles = signal<apiGenericModel[]>([]);

  /**
   * Form for creating new title
   */
  formSaveTitle = new FormGroup({
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
    this.utils.setTitle('Titles');
  }

  /**
   * This method will update title against id
   * @param id {number} title id
   * @param name {string} title name
   * @param description {string} title description
   */
  update(id: number, name: string, description: string) {
    this.subscriptionList.push(
      this.titleService.updateTitle(id, name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast('Title updated successfully.', 'success');
          this.titleService.refreshTitles();
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error'); // Show error toast
        },
      })
    );
  }

  /**
   * This method will create new title
   * @param name {string} title name
   * @param description {string} title description
   */
  create(name: string, description: string) {
    this.subscriptionList.push(
      this.titleService.createTitle(name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast(res.message, 'success');
          this.titleService.refreshTitles();
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
   * @param title title
   */
  onEdit(title: any) {
    this.titles().forEach((element: apiGenericModel) => {
      element.isEdit = false;
    });
    title.isEdit = true;
  }

  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('title-table', 'Consult-title-export');
  }

  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formSaveTitle.reset();
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
