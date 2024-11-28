import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { apiGenericModel } from '../../Models/Generic';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { VisualService } from '../../Services/visual.service';
import { UtilitiesService } from '../../Services/utilities.service';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../../Widgets/toast/toast.component';

@Component({
  selector: 'app-visual',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './visual.component.html',
  styleUrl: './visual.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualComponent implements OnInit, OnDestroy {
  /**
   * Visual signal
   */
  visuals = signal<apiGenericModel[]>([]);
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * Form for creating new visual
   */
  formSaveVisual = new FormGroup({
    name: new FormControl(),
    description: new FormControl(),
  });

  /**
   * Constructor
   * @param visualService visual service for api calls
   * @param utils utilities service for set page title
   */
  constructor(
    private visualService: VisualService,
    private utils: UtilitiesService
  ) {}

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Visuals');
    this.getAll();
  }

  /**
   * This method will fetch all the records from database.
   */
  getAll() {
    this.subscriptionList.push(
      this.visualService.getAllVisuals().subscribe((res: any) => {
        this.visuals.set(res);
      })
    );
  }

  /**
   * This method will update visual against id
   * @param id {number} visual id
   * @param name {string} visual name
   * @param description {string} visual description
   */
  update(id: number, name: string, description: string) {
    this.subscriptionList.push(
      this.visualService.updateVisual(id, name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast('Visual updated successfully.', 'success');
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error'); // Show error toast
        },
      })
    );
  }

  /**
   * This method will create new visual
   * @param name {string} visual name
   * @param description {string} visual description
   */
  create(name: string, description: string) {
    this.subscriptionList.push(
      this.visualService.createVisual(name, description).subscribe({
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
   * @param visual visual
   */
  onEdit(visual: any) {
    this.visuals().forEach((element: apiGenericModel) => {
      element.isEdit = false;
    });
    visual.isEdit = true;
  }

  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('visual-table', 'Consult-visual-export');
  }

  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formSaveVisual.reset();
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
