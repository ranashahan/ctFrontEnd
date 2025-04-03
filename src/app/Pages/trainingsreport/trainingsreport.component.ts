import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
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
import {
  ApexLegend,
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexFill,
  NgApexchartsModule,
} from 'ng-apexcharts';

@Component({
  selector: 'app-trainingsreport',
  imports: [ReactiveFormsModule, ToastComponent, NgApexchartsModule],
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
  @ViewChild('chart') chart!: ChartComponent;

  public trendTrainings: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
    fill: ApexFill;
    title: ApexTitleSubtitle;
  };

  public trendTrainingsStacked: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    responsive: ApexResponsive[];
    xaxis: ApexXAxis;
    legend: ApexLegend;
    fill: ApexFill;
  };

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
  trainingCount = this.trainingService.trainingReportCount;

  filteredContractors = computed(() => {
    const clientid = this.selectedClient();
    return clientid
      ? this.contractors().filter(
          (c) => Number(c.clientid) === Number(clientid)
        )
      : this.contractors();
  });

  constructor(private fb: FormBuilder) {
    this.trendTrainingsStacked = {
      series: [
        {
          name: 'PRODUCT A',
          data: [44, 55, 41, 67, 22, 43],
        },
        {
          name: 'PRODUCT B',
          data: [13, 23, 20, 8, 13, 27],
        },
        {
          name: 'PRODUCT C',
          data: [11, 17, 15, 15, 21, 14],
        },
        {
          name: 'PRODUCT D',
          data: [21, 7, 25, 13, 22, 8],
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
        stacked: true,
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: true,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0,
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      dataLabels: {
        enabled: true,
      },
      xaxis: {
        type: 'category',
        categories: [
          '01/2011',
          '02/2011',
          '03/2011',
          '04/2011',
          '05/2011',
          '06/2011',
        ],
      },
      legend: {
        position: 'top',
        offsetY: 40,
      },
      fill: {
        opacity: 1,
      },
    };

    this.trendTrainings = {
      series: [
        {
          name: 'Trainings',
          data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2],
        },
      ],
      chart: {
        height: 350,
        type: 'bar',
      },

      plotOptions: {
        bar: {
          dataLabels: {
            position: 'top', // top, center, bottom
          },
        },
      },
      dataLabels: {
        enabled: true,

        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758'],
        },
      },

      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        position: 'top',
        labels: {
          offsetY: -18,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#D8E3F0',
              colorTo: '#BED1E6',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            },
          },
        },
        tooltip: {
          enabled: true,
          offsetY: -35,
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [50, 0, 100, 100],
        },
      },
      yaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
        },
      },
      title: {
        text: 'Monthly Assessments, ' + new Date().getFullYear(),
        floating: false,
        offsetY: 320,
        align: 'center',
        style: {
          color: '#444',
        },
      },
    };

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
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.trainingService.trainingReportCount.reload();
    this.utils.setTitle('Training Reports');
    this.getReportCount();
  }

  /**
   * This method will generate charts
   */
  public getReportCount() {
    if (this.trainingCount.hasValue()) {
      var dataSeries = this.getMonthlyTotals(this.trainingCount.value().series);
      this.trendTrainings = {
        series: [
          {
            name: 'Assessments',
            data: dataSeries,
          },
        ],
        chart: {
          height: 350,
          type: 'bar',
        },

        plotOptions: {
          bar: {
            dataLabels: {
              position: 'top', // top, center, bottom
            },
            colors: {
              ranges: [
                {
                  from: 0,
                  to: 20,
                  color: '#DE3163', // Red for values 0-50
                },
                {
                  from: 21,
                  to: 40, // Set a large upper limit
                  color: '#008FFB', // Yellow for values > 50
                },
                {
                  from: 41,
                  to: 1000, // Set a large upper limit
                  color: '#11a53c', // Green for values > 50
                },
              ],
            },
          },
        },
        dataLabels: {
          enabled: true,

          offsetY: -20,
          style: {
            fontSize: '12px',
            colors: ['#304758'],
          },
        },

        xaxis: {
          categories: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          position: 'top',
          labels: {
            offsetY: -18,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          crosshairs: {
            fill: {
              type: 'gradient',
              gradient: {
                colorFrom: '#D8E3F0',
                colorTo: '#BED1E6',
                stops: [0, 100],
                opacityFrom: 0.4,
                opacityTo: 0.5,
              },
            },
          },
          tooltip: {
            enabled: true,
            offsetY: -35,
          },
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'horizontal',
            shadeIntensity: 0.25,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [50, 0, 100, 100],
          },
        },
        yaxis: {
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            show: false,
          },
        },
        title: {
          text: 'Trainings, ' + new Date().getFullYear(),
          floating: false,
          offsetY: 320,
          align: 'center',
          style: {
            color: '#444',
          },
        },
      };

      this.trendTrainingsStacked = {
        series: this.trainingCount.value().series,
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
          toolbar: {
            show: true,
          },
          zoom: {
            enabled: true,
          },
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              legend: {
                position: 'bottom',
                offsetX: -10,
                offsetY: 0,
              },
            },
          },
        ],
        plotOptions: {
          bar: {
            horizontal: false,
          },
        },
        dataLabels: {
          enabled: true,
        },
        xaxis: {
          type: 'category',
          categories: this.trainingCount.value().categories,
        },
        legend: {
          position: 'top',
          offsetY: 10,
        },
        fill: {
          opacity: 1,
        },
      };
    }
  }

  /**
   * This method will convert stacked count into total month count
   * @param series Series
   * @returns total months count
   */
  private getMonthlyTotals(
    series: { name: string; data: number[] }[]
  ): number[] {
    return series.reduce((totals, form) => {
      form.data.forEach((count, index) => {
        totals[index] += count; // Add the count to the corresponding month
      });
      return totals;
    }, new Array(12).fill(0)); // Initialize an array of 12 zeros for 12 months
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
