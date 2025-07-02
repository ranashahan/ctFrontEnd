import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { apiVSessionModel } from '../../Models/Assessment';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { ExceljsService } from '../../Services/exceljs.service';
import { apiGenericModel } from '../../Models/Generic';

@Component({
  selector: 'app-assessmentsreport',
  imports: [DatePipe, ToastComponent, ReactiveFormsModule, NgApexchartsModule],
  templateUrl: './assessmentsreport.component.html',
  styleUrl: './assessmentsreport.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentsreportComponent implements OnInit, OnDestroy {
  private assessmentService = inject(AssessmentService);
  private reportService = inject(ReportService);
  private utils = inject(UtilitiesService);
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
  private exceljSReport = inject(ExceljsService);
  @ViewChild('chart') chart!: ChartComponent;

  /**
   * This method will render chart
   */
  public trendAssessments: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
    fill: ApexFill;
    title: ApexTitleSubtitle;
  };
  /**
   * This method will render chart
   */
  public trendAssessmentsStacked: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    responsive: ApexResponsive[];
    xaxis: ApexXAxis;
    legend: ApexLegend;
    fill: ApexFill;
    colors: string[];
  };

  session = signal<apiVSessionModel[]>([]);
  filteredSession = computed(
    () =>
      this.session()?.filter(
        (s) => s.resultid === 7001 || s.resultid === 7006
      ) || []
  );
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
  private colors = [
    '#008FFB', // Blue
    '#00E396', // green
    '#FEB019', // yellow
    '#FF4560', // pink
    '#775DD0', // purple
    '#608078', // gray
    '#d68156', // orange
    '#08a112', // Green
  ];

  assessmentCount = this.assessmentService.assessmentsCountReport;

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

  /**
   * Constructor
   * @param fb formbuilder
   * @param cdRef change detection
   */
  constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef) {
    this.trendAssessmentsStacked = {
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
      colors: this.colors,
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
        offsetY: 10,
      },
      fill: {
        opacity: 1,
      },
    };

    this.trendAssessments = {
      series: [
        {
          name: 'Assessments',
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
          colors: {
            ranges: [
              {
                from: 0,
                to: 50,
                color: '#FFBF00', // Yellow for values 0-50
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
        text: 'Monthly Assessments, ' + new Date().getFullYear(),
        floating: false,
        offsetY: 320,
        align: 'center',
        style: {
          color: '#444',
        },
      },
    };

    this.formSession = this.fb.group({
      sessionname: ['', Validators.required],
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
    this.assessmentService.assessmentsCountReport.reload();
    this.utils.setTitle('Assessment Reports');
    this.getReportCount();
  }

  /**
   * This method will generate charts
   */
  public getReportCount() {
    if (this.assessmentCount.hasValue()) {
      var series = this.assessmentCount.value().series;
      var dataSeries = this.getMonthlyTotals(
        this.assessmentCount.value().series
      );
      this.trendAssessments = {
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
                  to: 200,
                  color: '#DE3163', // Red for values 0-50
                },
                {
                  from: 201,
                  to: 350, // Set a large upper limit
                  color: '#FFBF00', // Yellow for values > 50
                },
                {
                  from: 351,
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
          text: 'Assessments, ' + new Date().getFullYear(),
          floating: false,
          offsetY: 320,
          align: 'center',
          style: {
            color: '#444',
          },
        },
      };

      this.trendAssessmentsStacked = {
        series: series,
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
        colors: this.colors,
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
          categories: this.assessmentCount.value().categories,
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
   * This method will fetch all the session against session name
   */
  public getSessionData(): void {
    this.apiCallInProgress.set(true);

    this.subscriptionList.push(
      this.assessmentService
        .getSessionReportByDate(this.formSession.value.sessionname)
        .subscribe({
          next: (data: any) => {
            if (!data) {
              this.utils.showToast(
                'Did not fetch any record, please update criteria',
                'warning'
              );
              this.apiCallInProgress.set(false);
            } else {
              this.session.set(data);
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
   * This method will fetch all the assessment scores along with driver & session data
   */
  public getReportByDate() {
    this.apiCallInProgress.set(true);
    this.subscriptionList.push(
      this.assessmentService
        .getSessionReportByDate(
          undefined,
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
  public getReportALL(): void {
    this.apiCallInProgress.set(true);

    this.subscriptionList.push(
      this.assessmentService
        .getSessionReportAll(
          undefined,
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
  public async downloadSessionReport() {
    if (this.filteredSession().length > 0) {
      await this.reportService.generatePdfReportSession(this.filteredSession());
    } else {
      this.utils.showToast('Did not find any records', 'warning');
    }
  }

  /**
   * This method will generate driver card report PDF
   */
  public async downloadDriverReport() {
    if (this.session().length > 0) {
      await this.reportService.generateCardPDF(this.session());
    } else {
      this.utils.showToast('Did not find any records', 'warning');
    }
  }

  /**
   * This method will generate card report in Docx (MsWord)
   */
  public downloadWordReport() {
    if (this.filteredSession().length > 0) {
      this.apiCallInProgress.set(true);
      // this.reportService.generateWordCards(this.filteredSession(), () => {
      //   this.apiCallInProgress.set(false); // Stop loading after download
      // });
      this.exceljSReport.exportDriversWithQr(
        this.filteredSession(),
        this.formSession.value.sessionname + '_qr',
        () => {
          this.apiCallInProgress.set(false); // Stop loading after download
        }
      );
    } else {
      this.utils.showToast('Did not find any records', 'warning');
    }
  }
  /**
   * This method will generate card report in Docx (MsWord)
   */
  public downloadWordSummary() {
    if (this.session().length > 0) {
      this.apiCallInProgress.set(true);
      this.reportService.generateWordSummary(this.session(), () => {
        this.apiCallInProgress.set(false); // Stop loading after download
      });
    } else {
      this.utils.showToast('Did not find any records', 'warning');
    }
  }

  /**
   * This method for get generic name for list
   * @param itemIds generic list
   * @param itemid generic item id
   * @returns genericName
   */
  public genericName(itemIds: apiGenericModel[], itemid: number): string {
    return this.utils.getGenericName(itemIds, itemid);
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
