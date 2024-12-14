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
import { StageService } from '../../Services/stage.service';
import { UtilitiesService } from '../../Services/utilities.service';

@Component({
  selector: 'app-stage',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './stage.component.html',
  styleUrl: './stage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StageComponent implements OnInit, OnDestroy {
  private stageService = inject(StageService);
  private utils = inject(UtilitiesService);
  /**
   * stage Signal
   */
  stages = this.stageService.stages;
  /**
   * Form for creating new stage
   */
  formSaveStage = new FormGroup({
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
    this.utils.setTitle('Stages');
  }

  /**
   * This method will update stage against id
   * @param id {number} stage id
   * @param name {string} stage name
   * @param description {string} stage description
   */
  update(id: number, name: string, description: string) {
    this.subscriptionList.push(
      this.stageService.updateStage(id, name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast('Stage updated successfully.', 'success');
          this.stageService.refreshStages();
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error'); // Show error toast
        },
      })
    );
  }

  /**
   * This method will create new stage
   * @param name {string} stage name
   * @param description {string} stage description
   */
  create(name: string, description: string) {
    this.subscriptionList.push(
      this.stageService.createStage(name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast(res.message, 'success');
          this.stageService.refreshStages();
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
   * @param stage stage
   */
  onEdit(stage: any) {
    this.stages().forEach((element: apiGenericModel) => {
      element.isEdit = false;
    });
    stage.isEdit = true;
  }

  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('stage-table', 'Consult-stage-export');
  }

  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formSaveStage.reset();
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
