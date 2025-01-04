import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { apiDriverModel } from '../../Models/Driver';
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
import { ExcelreportService } from '../../Services/excelreport.service';

@Component({
  selector: 'app-driversreport',
  imports: [ReactiveFormsModule, ToastComponent],
  templateUrl: './driversreport.component.html',
  styleUrl: './driversreport.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriversreportComponent implements OnInit, OnDestroy {
  private reportService = inject(ReportService);
  private utils = inject(UtilitiesService);
  private driverService = inject(DriverService);
  private cService = inject(ContractorService);
  private eReportService = inject(ExcelreportService);

  drivers = signal<apiDriverModel[]>([]);
  contractors = this.cService.contractors;
  formSelectContractor: FormGroup;
  formExpiry: FormGroup;

  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef) {
    this.formSelectContractor = this.fb.group({
      contractorid: [null, Validators.required],
    });

    this.formSelectContractor
      .get('contractorid')
      ?.valueChanges.subscribe((selectedContractorId) => {
        this.getDriversData(selectedContractorId);
      });

    this.formExpiry = this.fb.group({
      expiry: [null, Validators.required],
    });
  }
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Driver Reports');
  }

  /**
   * This method will fetch drivers against contractor id
   * @param contractorid {string} contractor id
   */
  public getDriversData(contractorid: number): void {
    this.subscriptionList.push(
      this.driverService
        .searchDrivers(
          undefined,
          undefined,
          undefined,
          contractorid,
          undefined,
          undefined,
          undefined
        )
        .subscribe((res: any) => {
          this.drivers.set(res);
          console.log(this.drivers());
        })
    );
  }

  /**
   * This method will download expiry report
   */
  public getDriversExpiry(): void {
    let formValue = this.formExpiry.getRawValue();
    console.log(formValue);
    this.subscriptionList.push(
      this.driverService.expiryReport(this.formExpiry.value.expiry).subscribe({
        next: (res: any) => {
          this.eReportService.exportJson(res, 'CNTD');
        },
        error: (err: any) => {
          this.utils.showToast(
            'Does not fetch any record, please update you filter',
            'warning'
          );
        },
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
   * This method for generate report against session
   * @param session session array
   */
  public downloadDriverReport(): void {
    this.reportService.generateDriverContractorReport(this.drivers());
    // this.reportService.generateDriverPdfReport(name, drivers);
  }

  /**
   * This method will reset form
   */
  public resetSelectorForm(): void {
    this.formSelectContractor.reset();
  }
  /**
   * This method will reset form
   */
  public resetExpiryForm(): void {
    this.formExpiry.reset();
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
