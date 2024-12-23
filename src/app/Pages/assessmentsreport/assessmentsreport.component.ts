import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { apiSessionModel } from '../../Models/Assessment';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UtilitiesService } from '../../Services/utilities.service';
import { AssessmentService } from '../../Services/assessment.service';
import { ReportService } from '../../Services/report.service';
import { DatePipe } from '@angular/common';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { ContractorService } from '../../Services/contractor.service';
import { ClientService } from '../../Services/client.service';
import { ExcelreportService } from '../../Services/excelreport.service';

@Component({
  selector: 'app-assessmentsreport',
  imports: [DatePipe, ToastComponent, ReactiveFormsModule],
  templateUrl: './assessmentsreport.component.html',
  styleUrl: './assessmentsreport.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentsreportComponent implements OnInit, OnDestroy {
  private cService = inject(ContractorService);
  private clientService = inject(ClientService);
  private excelReport = inject(ExcelreportService);
  session = signal<apiSessionModel[]>([]);
  contractors = this.cService.contractors;
  clients = this.clientService.clients;
  apiCallInProgress = signal<boolean>(false);

  selectedClient = signal<number | null>(null);

  filteredContractors = computed(() => {
    const clientid = this.selectedClient();
    return clientid
      ? this.contractors().filter(
          (c) => Number(c.clientid) === Number(clientid)
        )
      : this.contractors();
  });

  formSession: FormGroup;
  formDate: FormGroup;
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  constructor(
    private utils: UtilitiesService,
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private reportService: ReportService,
    private cdRef: ChangeDetectorRef
  ) {
    this.formSession = this.fb.group({
      name: 'session',
      sessiondate: [{ value: null }],
      locationid: [{ value: 0 }],
      resultid: [{ value: 0 }],
      classdate: [{ value: null }],
      nic: [{ value: '' }],
      drivername: [{ value: '' }],
      driverid: [{ value: 0 }],
    });

    this.formDate = this.fb.group({
      startDate: [this.utils.monthAgo(1).toISOString().substring(0, 10)],
      endDate: [this.utils.daysAhead(1).toISOString().substring(0, 10)],
      clientid: [null],
      contractorid: [null],
    });

    this.formDate.get('clientid')?.valueChanges.subscribe((clientid) => {
      this.selectedClient.set(clientid);
    });
  }

  ngOnInit(): void {
    this.utils.setTitle('Assessment Reports');
  }

  getSessionData() {
    this.subscriptionList.push(
      this.assessmentService
        .getSessionbydate(
          null,
          this.formSession.value.name,
          null,
          null,
          7001,
          null,
          null,
          undefined,
          undefined
        )
        .subscribe((res: any) => {
          this.session.set(res);
        })
    );
  }

  getReportByDate() {
    this.apiCallInProgress.set(true);
    this.subscriptionList.push(
      this.assessmentService
        .getSessionReportByDate(
          this.formDate.value.clientid,
          this.formDate.value.contractorid,
          this.formDate.value.startDate,
          this.formDate.value.endDate
        )
        .subscribe({
          next: (data) => {
            if (!data) {
              this.utils.showToast(
                'Did not fetch any record, please update criteria',
                'warning'
              );
              this.apiCallInProgress.set(false);
            } else {
              console.log(data);

              this.excelReport.exportToExcel(data, 'CNTA');
              this.apiCallInProgress.set(false);
            }
          },
          error: (err: any) => {
            this.utils.showToast(err.message, 'error');
            this.apiCallInProgress.set(false);
          },
        })
    );
  }

  public formReset(): void {
    this.formDate.reset({
      startDate: [this.utils.monthAgo(1).toISOString().substring(0, 10)],
      endDate: [this.utils.daysAhead(1).toISOString().substring(0, 10)],
    });
  }

  /**
   * This method for generate report against session
   * @param session session array
   */
  async downloadSessionReport(session: apiSessionModel[]) {
    await this.reportService.generatePdfReportSession(session);
  }

  ngOnDestroy(): void {}
}
