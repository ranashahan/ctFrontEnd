import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
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
import { Subscription } from 'rxjs';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { apiGenericModel } from '../../Models/Generic';
import { DltypeService } from '../../Services/dltype.service';
import { UtilitiesService } from '../../Services/utilities.service';

@Component({
  selector: 'app-dltype',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './dltype.component.html',
  styleUrl: './dltype.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DltypeComponent implements OnInit, OnDestroy {
  /**
   * dltype signal
   */
  dltypes = signal<apiGenericModel[]>([]);
  /**
   * Form for creating new visual
   */
  formSaveDLType = new FormGroup({
    name: new FormControl(),
    description: new FormControl(),
  });
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];
  /**
   * Constructor
   * @param dltypeService dltype service for api calls
   * @param utils utilities service for set page title
   */
  constructor(
    private dltypeService: DltypeService,
    private utils: UtilitiesService
  ) {}
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Driver License Type');
    this.getAll();
  }
  /**
   * This method will fetch all the records from database.
   */
  getAll() {
    this.subscriptionList.push(
      this.dltypeService.getAllDLTypes().subscribe((res: any) => {
        this.dltypes.set(res);
      })
    );
  }
  /**
   * This method will update dltype against id
   * @param id {number} dltype id
   * @param name {string} dltype name
   * @param description {string} dltype description
   */
  updateDLType(id: number, name: string, description: string) {
    this.subscriptionList.push(
      this.dltypeService.updateDLTypes(id, name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast(
            'Driver license type updated successfully.',
            'success'
          );
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error'); // Show error toast
        },
      })
    );
  }
  /**
   * This method will create new dltype
   * @param name {string} dltype name
   * @param description {string} dltype description
   */
  createDLType(name: string, description: string) {
    this.subscriptionList.push(
      this.dltypeService.createDLTypes(name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast(res.message, 'success');
          this.getAll();
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
   * @param dltype dltype
   */
  onEdit(dltype: any) {
    this.dltypes().forEach((element: apiGenericModel) => {
      element.isEdit = false;
    });
    dltype.isEdit = true;
  }
  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('dltype-table', 'Consult-dltypes-export');
  }
  /**
   * This method will reset the form value to blank
   */
  formReset() {
    this.formSaveDLType.reset();
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
