import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { UtilitiesService } from '../../Services/utilities.service';
import { TrainingService } from '../../Services/training.service';
import { TrainerService } from '../../Services/trainer.service';
import { apiTrainingModel } from '../../Models/Training';
import { Subscription } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContractorService } from '../../Services/contractor.service';
import { ClientService } from '../../Services/client.service';
import { LocationService } from '../../Services/location.service';
import { CourseService } from '../../Services/course.service';
import { CategoryService } from '../../Services/category.service';
import { TitleService } from '../../Services/title.service';
import { ExcelreportService } from '../../Services/excelreport.service';
import { ToastComponent } from '../../Widgets/toast/toast.component';

@Component({
  selector: 'app-trainingsreport',
  imports: [ReactiveFormsModule, ToastComponent],
  templateUrl: './trainingsreport.component.html',
  styleUrl: './trainingsreport.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingsreportComponent implements OnInit, OnDestroy {
  private utils = inject(UtilitiesService);
  private trainingService = inject(TrainingService);
  private cService = inject(ContractorService);
  private clientService = inject(ClientService);
  private locationService = inject(LocationService);
  private titleService = inject(TitleService);
  private courseService = inject(CourseService);
  private categoryService = inject(CategoryService);
  private trainerService = inject(TrainerService);
  private subscriptionList: Subscription[] = [];
  private excelReport = inject(ExcelreportService);

  trainers = this.trainerService.trainers;
  trainings = signal<apiTrainingModel[]>([]);
  contractors = this.cService.contractors;
  clients = this.clientService.clients;
  titles = this.titleService.titles;
  courses = this.courseService.courses;
  categories = this.categoryService.categories;
  locations = this.locationService.locations;
  statuses = signal(this.utils.statuses());
  sources = signal(this.utils.sources());
  formAll: FormGroup;
  formFinance: FormGroup;
  apiCallInProgress = signal<boolean>(false);
  selectedClient = signal<number | null>(null);
  years = signal(this.utils.years());
  months = signal(this.utils.months());

  filteredContractors = computed(() => {
    const clientid = this.selectedClient();
    return clientid
      ? this.contractors().filter(
          (c) => Number(c.clientid) === Number(clientid)
        )
      : this.contractors();
  });

  constructor(private fb: FormBuilder) {
    this.formAll = fb.group({
      startDate: [this.utils.monthAgo(3).toISOString().substring(0, 10)],
      endDate: [this.utils.daysAhead(1).toISOString().substring(0, 10)],
      courseid: [null],
      categoryid: [null],
      clientid: [null],
      contractorid: [null],
      titleid: [null],
      trainerid: [null],
      locationid: [null],
      source: [null],
      status: [null],
    });

    this.formAll.get('clientid')?.valueChanges.subscribe((clientid) => {
      this.selectedClient.set(clientid);
    });

    this.formFinance = fb.group({
      month: [null],
      year: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.utils.setTitle('Trainin Reports');
  }

  /**
   * This method will generate report all
   */
  public getReportALL(): void {
    this.apiCallInProgress.set(true);

    this.subscriptionList.push(
      this.trainingService
        .getTrainingReportAll(
          undefined,
          this.formAll.value.courseid,
          this.formAll.value.categoryid,
          this.formAll.value.clientid,
          this.formAll.value.contractorid,
          this.formAll.value.titleid,
          this.formAll.value.trainerid,
          this.formAll.value.locationid,
          this.formAll.value.source,
          this.formAll.value.status,
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
              this.excelReport.exportTrainingReportAll(data, 'CNTT');
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
   * This method will export finance report
   */
  public exportFinance(): void {
    this.apiCallInProgress.set(true);
    this.formFinance.getRawValue();

    this.subscriptionList.push(
      this.trainingService
        .getTrainingFinanceReport(
          this.formFinance.value.month,
          this.formFinance.value.year
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
              this.excelReport.exportTrainingFinanceReport(data, 'CNTTF');
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
   * This method will reset the form value to blank
   */
  resetForm(): void {
    this.formAll.reset();
    this.formFinance.reset();
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
