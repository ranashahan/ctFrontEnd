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
import { Subscription } from 'rxjs';
import { apiTrainerModel } from '../../Models/Trainer';
import { UtilitiesService } from '../../Services/utilities.service';
import { TrainerService } from '../../Services/trainer.service';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../../Widgets/toast/toast.component';

@Component({
  selector: 'app-trainers',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ToastComponent],
  templateUrl: './trainers.component.html',
  styleUrl: './trainers.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainersComponent implements OnInit, OnDestroy {
  private trainerService = inject(TrainerService);
  private utils = inject(UtilitiesService);
  /**
   * Form for creating new trainer
   */
  formSaveTrainer = new FormGroup({
    name: new FormControl(),
    initials: new FormControl(),
    mobile: new FormControl(),
    address: new FormControl(),
  });
  /**
   * trainer Signal
   */
  trainers = this.trainerService.trainers;
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Trainers');
  }

  /**
   * This method will update trainer against id
   * @param id {number} trainer id
   * @param name {string} trainer name
   * @param initials {string} trainer initials
   * @param mobile {string} trainer mobile
   * @param address {string} trainer address
   */

  updateTrainer(
    id: number,
    name: string,
    initials: string,
    mobile: string,
    address: string
  ) {
    this.subscriptionList.push(
      this.trainerService
        .updateTrainer(id, name, initials, mobile, address)
        .subscribe({
          next: (res: any) => {
            this.utils.showToast('Trainer Update successfully', 'success');
            this.trainerService.refreshTrainers();
          },
          error: (err: any) => {
            const errorMessage = err?.message || 'An unexpected error occurred';
            this.utils.showToast(errorMessage, 'error'); // Show error toast
          },
        })
    );
  }

  /**
   * This method will create new trainer
   * @param name {string} trainer name
   * @param initials {string} trainer initials
   * @param mobile {string} trainer mobile
   * @param address {string} trainer address
   */
  createTrainer(
    name: string,
    initials: string,
    mobile: string,
    address: string
  ) {
    this.subscriptionList.push(
      this.trainerService
        .createTrainer(name, initials, mobile, address)
        .subscribe({
          next: (res: any) => {
            this.utils.showToast(res.message, 'success');
            this.trainerService.refreshTrainers();
          },
          error: (err: any) => {
            const errorMessage = err?.message || 'An unexpected error occurred';
            this.utils.showToast(errorMessage, 'error'); // Show error toast
          },
        })
    );
  }

  /**
   * This method will diactive the trainer
   * @param id trainerid
   */
  deleteTrainer(id: number) {
    const isConfirmed = confirm(
      'Are you sure you want to delete this trainer:' + id
    );

    if (isConfirmed) {
      this.subscriptionList.push(
        this.trainerService.deleteTrainer(id).subscribe({
          next: (data) => {
            this.utils.showToast(
              'Trainer has been deleted successfully',
              'success'
            );
            this.trainerService.refreshTrainers();
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
   * @param trainer trainer
   */
  onEdit(trainer: any) {
    this.trainers().forEach((element: apiTrainerModel) => {
      element.isEdit = false;
    });
    trainer.isEdit = true;
  }
  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('trainer-table', 'Consult-trainer-export');
  }
  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formSaveTrainer.reset();
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
