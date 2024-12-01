import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { apiDriverModel } from '../../Models/Driver';
import { apiContractorModel } from '../../Models/Contractor';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ReportService } from '../../Services/report.service';
import { UtilitiesService } from '../../Services/utilities.service';
import { DriverService } from '../../Services/driver.service';
import { ContractorService } from '../../Services/contractor.service';
import { ToastComponent } from '../../Widgets/toast/toast.component';

@Component({
  selector: 'app-driversreport',
  imports: [ReactiveFormsModule, ToastComponent],
  templateUrl: './driversreport.component.html',
  styleUrl: './driversreport.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriversreportComponent implements OnInit, OnDestroy {
  drivers = signal<apiDriverModel[]>([]);
  contractors = signal<apiContractorModel[]>([]);
  formSelectContractor: FormGroup;

  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  constructor(
    private reportService: ReportService,
    private utils: UtilitiesService,
    private driverService: DriverService,
    private cService: ContractorService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    this.formSelectContractor = this.fb.group({
      contractorid: [null, Validators.required],
    });

    this.formSelectContractor
      .get('contractorid')
      ?.valueChanges.subscribe((selectedContractorId) => {
        this.getDriversData(selectedContractorId);
      });
  }
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Driver Reports');
    this.getContractors();
  }

  /**
   * This methid will get contractors
   */
  getContractors() {
    this.subscriptionList.push(
      this.cService.getAll().subscribe((res: any) => {
        this.contractors.set(res);
      })
    );
  }

  /**
   * This method will fetch drivers against contractor id
   * @param contractorid {string} contractor id
   */
  getDriversData(contractorid: string) {
    this.subscriptionList.push(
      this.driverService
        .searchDrivers(null, null, null, contractorid)
        .subscribe((res: any) => {
          this.drivers.set(res);
        })
    );
  }

  /**
   * This method will set contractor name against contractor ID
   * @param itemId contractor ID
   * @returns string contractor name
   */
  getContractorName(itemId: number): string {
    return this.utils.getGenericName(this.contractors(), itemId);
  }

  /**
   * This method for download Report
   */
  downloadReport() {
    const reportData = [
      { field1: 'Data 1', field2: 'Data 2', field3: 'Data 3' },
      { field1: 'Data 4', field2: 'Data 5', field3: 'Data 6' },
    ];
    this.reportService.generatePdfReport(reportData);
  }

  /**
   * This method for generate report against session
   * @param session session array
   */
  downloadDriverReport(drivers: apiDriverModel[]) {
    let name = this.getContractorName(
      this.formSelectContractor.get('contractorid')?.value
    );
    // console.log(name);
    this.reportService.generateDriverPdfReport(name, drivers);
    this.utils.showToast('Report generated', 'info');
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
