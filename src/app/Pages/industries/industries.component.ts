import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
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
import { IndustriesService } from '../../Services/industries.service';

@Component({
  selector: 'app-industries',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, ToastComponent],
  templateUrl: './industries.component.html',
  styleUrl: './industries.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndustriesComponent implements OnInit, OnDestroy {
  private industriesService = inject(IndustriesService);
  private utils = inject(UtilitiesService);
  /**
   * Industries Signal
   */
  industries = this.industriesService.industries;

  /**
   * Form for creating new Industries
   */
  formSaveIndustries = new FormGroup({
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
    this.utils.setTitle('Industries');
  }

  /**
   * This method will update Industries against id
   * @param id {number} Industries id
   * @param name {string} Industries name
   * @param description {string} Industries description
   */
  update(id: number, name: string, description: string) {
    this.subscriptionList.push(
      this.industriesService.updateIndustries(id, name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast('Industries updated successfully.', 'success');
          this.industriesService.refreshIndustriess();
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error'); // Show error toast
        },
      })
    );
  }

  /**
   * This method will create new Industries
   * @param name {string} Industries name
   * @param description {string} Industries description
   */
  create(name: string, description: string) {
    this.subscriptionList.push(
      this.industriesService.createIndustries(name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast(res.message, 'success');
          this.industriesService.refreshIndustriess();
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
   * @param Industries Industries
   */
  onEdit(Industries: any) {
    this.industries().forEach((element: apiGenericModel) => {
      element.isEdit = false;
    });
    Industries.isEdit = true;
  }

  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('industries-table', 'Consult-Industries-export');
  }

  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formSaveIndustries.reset();
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
