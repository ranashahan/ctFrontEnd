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
  trainers = signal<apiTrainerModel[]>([]);
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * Constructor
   * @param trainerService trainer service for api calls
   * @param utils utilities service for set page title
   */
  constructor(
    private utils: UtilitiesService,
    private trainerService: TrainerService
  ) {}
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Trainers');
    this.getAll();
  }

  /**
   * This method will fetch all the records from database.
   */
  getAll() {
    this.subscriptionList.push(
      this.trainerService.getAllTrainers().subscribe((res: any) => {
        this.trainers.set(res);
      })
    );
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
