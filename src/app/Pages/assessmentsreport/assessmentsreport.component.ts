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
import { DltypeService } from '../../Services/dltype.service';
import { BloodgroupService } from '../../Services/bloodgroup.service';
import { VisualService } from '../../Services/visual.service';
import { LocationService } from '../../Services/location.service';
import { ResultService } from '../../Services/result.service';
import { StageService } from '../../Services/stage.service';
import { TitleService } from '../../Services/title.service';
import { VehicleService } from '../../Services/vehicle.service';
import { TrainerService } from '../../Services/trainer.service';

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
  private dlTypeService = inject(DltypeService);
  private bgService = inject(BloodgroupService);
  private visualService = inject(VisualService);
  private locationService = inject(LocationService);
  private resultService = inject(ResultService);
  private stageService = inject(StageService);
  private titleService = inject(TitleService);
  private vehicleService = inject(VehicleService);
  private trainerService = inject(TrainerService);
  private excelReport = inject(ExcelreportService);

  session = signal<apiSessionModel[]>([]);
  contractors = this.cService.contractors;
  clients = this.clientService.clients;
  dltypes = this.dlTypeService.dltypes;
  bloodgroups = this.bgService.bloodGroups;
  visuals = this.visualService.visuals;
  locations = this.locationService.locations;
  results = this.resultService.results;
  stages = this.stageService.stages;
  titles = this.titleService.titles;
  vehicles = this.vehicleService.vehicles;
  trainers = this.trainerService.trainers;

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
  formAll: FormGroup;
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

    this.formAll = this.fb.group({
      startDate: [this.utils.monthAgo(1).toISOString().substring(0, 10)],
      endDate: [this.utils.daysAhead(1).toISOString().substring(0, 10)],
      licensetypeid: [null],
      bloodgroupid: [null],
      visualid: [null],
      locationid: [null],
      resultid: [null],
      stageid: [null],
      titleid: [null],
      vehicleid: [null],
      contractorid: [null],
      trainerid: [null],
    });
  }
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Assessment Reports');
  }

  /**
   * This method will fetch all the session against session name
   */
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

  /**
   * This method will fetch all the assessment scores along with driver & session data
   */
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
  /**
   * This method will fetch all the records for report
   */
  getReportALL() {
    this.apiCallInProgress.set(true);

    this.subscriptionList.push(
      this.assessmentService
        .getSessionReportAll(
          this.formAll.value.licensetypeid,
          this.formAll.value.bloodgroupid,
          this.formAll.value.visualid,
          this.formAll.value.locationid,
          this.formAll.value.resultid,
          this.formAll.value.stageid,
          this.formAll.value.titleid,
          this.formAll.value.vehicleid,
          this.formAll.value.contractorid,
          this.formAll.value.trainerid,
          this.formAll.value.startDate,
          this.formAll.value.endDate
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

              this.excelReport.exportReportAll(data, 'CNTA');
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

  /**
   * This method will reset form
   */
  public formDateReset(): void {
    this.formDate.reset({
      startDate: [this.utils.monthAgo(1).toISOString().substring(0, 10)],
      endDate: [this.utils.daysAhead(1).toISOString().substring(0, 10)],
    });
  }
  /**
   * This method will reset form
   */
  public formAllReset(): void {
    this.formAll.reset({
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

  /**
   * This method will destory all the subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptionList.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });
  }
}
