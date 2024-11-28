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
import { VehicleService } from '../../Services/vehicle.service';
import { UtilitiesService } from '../../Services/utilities.service';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../../Widgets/toast/toast.component';

@Component({
  selector: 'app-vehicle',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ToastComponent],
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleComponent implements OnInit, OnDestroy {
  /**
   * vehicle signal
   */
  vehicles = signal<apiGenericModel[]>([]);
  /**
   * Form for creating new vehicle
   */
  formSaveVehicle = new FormGroup({
    name: new FormControl(),
    description: new FormControl(),
  });
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];
  /**
   * Constructor
   * @param vehicleService vehicle service for api calls
   * @param utils utilities service for set page title
   */
  constructor(
    private vehicleService: VehicleService,
    private utils: UtilitiesService
  ) {}

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Vehicles');
    this.getAll();
  }

  /**
   * This method will fetch all the records from database.
   */
  getAll() {
    this.subscriptionList.push(
      this.vehicleService.getAllVehicles().subscribe((res: any) => {
        this.vehicles.set(res);
      })
    );
  }

  /**
   * This method will update vehicle against id
   * @param id {number} vehicle id
   * @param name {string} vehicle name
   * @param description {string} vehicle description
   */
  update(id: number, name: string, description: string) {
    this.subscriptionList.push(
      this.vehicleService.updateVehicle(id, name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast('Vehicle updated successfully.', 'success');
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error'); // Show error toast
        },
      })
    );
  }

  /**
   * This method will create new vehicle
   * @param name {string} vehicle name
   * @param description {string} vehicle description
   */
  create(name: string, description: string) {
    this.subscriptionList.push(
      this.vehicleService.createVehicle(name, description).subscribe({
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
   * @param vehicle vehicle
   */
  onEdit(vehicle: any) {
    this.vehicles().forEach((element: apiGenericModel) => {
      element.isEdit = false;
    });
    vehicle.isEdit = true;
  }
  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('vehicle-table', 'Consult-vehicle-export');
  }

  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formSaveVehicle.reset();
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
