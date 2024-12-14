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
import { apiGenericModel } from '../../Models/Generic';
import { Subscription } from 'rxjs';
import { LocationService } from '../../Services/location.service';
import { UtilitiesService } from '../../Services/utilities.service';

@Component({
  selector: 'app-location',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, ToastComponent],
  templateUrl: './location.component.html',
  styleUrl: './location.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationComponent implements OnInit, OnDestroy {
  private locationService = inject(LocationService);
  private utils = inject(UtilitiesService);

  /**
   * location signal
   */
  locations = this.locationService.locations;

  /**
   * Form for creating new vehicle
   */
  formSaveLocation = new FormGroup({
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
    this.utils.setTitle('Locations');
  }

  /**
   * This method will update location against id
   * @param id {number} location id
   * @param name {string} location name
   * @param description {string} location description
   */
  updateLocation(id: number, name: string, description: string) {
    this.subscriptionList.push(
      this.locationService.updateLocation(id, name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast('Location updated successfully.', 'success');
          this.locationService.refreshLocations();
        },
        error: (err: any) => {
          const errorMessage = err?.message || 'An unexpected error occurred';
          this.utils.showToast(errorMessage, 'error'); // Show error toast
        },
      })
    );
  }

  /**
   * This method will create new location
   * @param name {string} location name
   */
  createLocation(name: string, description: string) {
    this.subscriptionList.push(
      this.locationService.createLocation(name, description).subscribe({
        next: (res: any) => {
          this.utils.showToast(res.message, 'success');
          this.locationService.refreshLocations();
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
   * @param location location
   */
  onEdit(location: any) {
    this.locations().forEach((element: apiGenericModel) => {
      element.isEdit = false;
    });
    location.isEdit = true;
  }

  /**
   * This method will export to excel
   */
  executeExport() {
    this.utils.exportToExcel('location-table', 'Consult-location-export');
  }

  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formSaveLocation.reset();
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
