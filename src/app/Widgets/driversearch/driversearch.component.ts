import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { apiDriverModel } from '../../Models/Driver';
import { DriverService } from '../../Services/driver.service';
declare var bootstrap: any;
@Component({
  selector: 'app-driversearch',
  imports: [ReactiveFormsModule],
  templateUrl: './driversearch.component.html',
  styleUrl: './driversearch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriversearchComponent implements OnDestroy {
  /**
   * Search form
   */
  searchForm: FormGroup;
  /**
   * Driver signal
   */
  drivers = signal<apiDriverModel[]>([]);
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];
  /**
   * Output
   */
  @Output() driverSelected = new EventEmitter<object>(); // Event to emit driver ID

  /**
   * Constructor
   * @param fb form builder
   * @param driverService driver service
   * @param cdRef Change detector Reference
   */
  constructor(
    private fb: FormBuilder,
    private driverService: DriverService,
    private cdRef: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      nic: ['', Validators.required],
    });
  }

  /**
   * This method for search driver by nic
   */
  searchDrivers(): void {
    const searchCriteria = this.searchForm.value.nic;
    this.subscriptionList.push(
      this.driverService
        .getDriverByNIC(searchCriteria)
        .subscribe((data: any) => {
          this.drivers.set(data);
        })
    );
  }

  /**
   * This method for return driver object
   * @param driver
   */
  selectDriver(driver: object) {
    this.driverSelected.emit(driver); // Emit the selected driver ID
  }

  /**
   * This method for open modal
   */
  openModal(): void {
    const modalElement = document.getElementById('driverSearchModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      this.searchForm.reset();
      modalInstance.show();
    } else {
      console.error('Modal element not found');
    }
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
