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
import {
  ApexChart,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexDataLabels,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  ApexFill,
  ApexPlotOptions,
  ApexLegend,
  NgApexchartsModule,
  ChartComponent,
  ApexTooltip,
} from 'ng-apexcharts';
import { of, Subscription } from 'rxjs';
import { UtilitiesService } from '../../Services/utilities.service';
import { LocationService } from '../../Services/location.service';
import { DriverService } from '../../Services/driver.service';
import { TrainerService } from '../../Services/trainer.service';
import { TrainingService } from '../../Services/training.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { ClientService } from '../../Services/client.service';
import { ContractorService } from '../../Services/contractor.service';
import { ROLES } from '../../Models/Constants';
import { AuthService } from '../../Services/auth.service';
import { AssessmentService } from '../../Services/assessment.service';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [NgApexchartsModule, ToastComponent, DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('chart') chart!: ChartComponent;
  private authService = inject(AuthService);
  private trainingService = inject(TrainingService);
  private assessmentService = inject(AssessmentService);
  private utils = inject(UtilitiesService);
  private locationService = inject(LocationService);
  private driverService = inject(DriverService);
  private trainerService = inject(TrainerService);
  private clientService = inject(ClientService);
  private cService = inject(ContractorService);

  public trendCOpt: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    dataLabels: ApexDataLabels;
    fill: ApexFill;
    colors: string[];
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
  };
  public locationCOpt: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    plotOptions: ApexPlotOptions;
    title: ApexTitleSubtitle;
    colors: string[];
    legend: ApexLegend;
  };
  public trainerCOpt: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    colors: string[];
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    fill: ApexFill;
    stroke: ApexStroke;
    tooltip: ApexTooltip;
  };
  public trainerPOpt: {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: any;
    legend: ApexLegend;
    colors: string[];
    responsive: ApexResponsive[];
  };

  subscriptionList: Subscription[] = [];
  yearlyDrivers = signal<number>(0);
  monthlyDrivers = signal<number>(0);
  yearlySessions = signal<number>(0);
  monthlySessions = signal<number>(0);
  private trainers = this.trainerService.trainers;
  private clients = this.clientService.clients;
  private contractors = this.cService.contractors;
  private trainings = toSignal(
    computed(
      () =>
        this.authService.getUserRole() === ROLES.ADMIN ||
        this.authService.getUserRole() === ROLES.MANAGER ||
        this.authService.getUserRole() === ROLES.BILLER
          ? this.trainingService.getAllTraining() // Returns an Observable
          : of([]) // Also an Observable
    )(),
    { initialValue: [] } // Ensure initial state
  );
  // this.trainingService.getAllTraining());
  public latestTrainings = computed(() => {
    const trainingsValue = this.trainings();
    if (!trainingsValue || trainingsValue.length === 0) {
      return []; // Return an empty array if no trainings
    }
    return [...trainingsValue].slice(0, 5);
  });

  public sessions = this.assessmentService.searchLatestSessions;
  private colors = [
    '#008FFB', // Blue
    '#00E396', // green
    '#FEB019', // yellow
    '#FF4560', // pink
    '#775DD0', // purple
    '#608078', // gray
    '#d68156', // Gray
    '#08a112', // Green
  ];
  /**
   * Constructor
   * @param utils utility service
   * @param locationService location service
   * @param driverService driver service
   * @param trainerService trainer service
   * @param cdRef Change detector Reference
   */
  constructor(private cdRef: ChangeDetectorRef) {
    this.locationCOpt = {
      series: [
        {
          data: [
            {
              x: 'Karachi',
              y: 218,
            },
          ],
        },
      ],
      legend: {
        show: false,
      },
      chart: {
        height: 350,
        type: 'treemap',
      },
      title: {
        text: 'Locations',
        align: 'center',
      },
      colors: ['#3B93A5'],
      plotOptions: {
        treemap: {
          distributed: true,
          enableShades: false,
        },
      },
    };

    this.trendCOpt = {
      series: [
        {
          name: 'Revenue',
          data: [45000, 56000, 62000, 70000, 75000, 78000],
        },
      ],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false,
        },
      },
      xaxis: {
        categories: ['January', 'February', 'March', 'April', 'May', 'June'],
      },
      yaxis: {
        title: {
          text: 'Revenue (USD)',
        },
      },
      title: {
        text: 'Monthly Revenue Trend',
        align: 'left',
      },
      colors: ['#008FFB'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      fill: {
        type: 'solid',
      },
    };

    this.trainerCOpt = {
      series: [
        {
          name: 'Joseph babulal',
          data: [12, 3],
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
      },

      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: this.colors,
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: [
          'Nov',
          'Dec',
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
        ],
      },
      yaxis: {
        title: {
          text: 'Total (assessments)',
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val + ' assessments';
          },
        },
      },
    };

    this.trainerPOpt = {
      series: [44],
      colors: this.colors,
      chart: {
        type: 'pie',
        height: 350,
      },
      labels: [], // no labels shown outside
      legend: {
        show: false, // hides legend
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit() {
    this.utils.setTitle('Dashboard');
    this.getLocationData();
    this.getDriverSessionData();
    this.getTrainerSessionData();
    this.getTrainerSessionPie();
  }

  /**
   * This method will fetch location count for dashboard.
   */
  private getLocationData() {
    this.subscriptionList.push(
      this.locationService.getLocationsCount().subscribe((results: any) => {
        const chartData = results.map(
          (result: { location_name: string; session_count: number }) => ({
            x: result.location_name,
            y: result.session_count,
          })
        );
        this.locationCOpt = {
          series: [
            {
              data: chartData,
            },
          ],
          legend: {
            show: false,
          },
          chart: {
            height: 350,
            type: 'treemap',
          },
          title: {
            text: 'Statistics',
            align: 'left',
            style: {
              fontSize: '14px',
              fontWeight: 'bold',

              color: '#716de3',
            },
          },
          colors: [
            '#3B93A5',
            '#F7B844',
            '#ADD8C7',
            '#EC3C65',
            '#CDD7B6',
            '#C1F666',
            '#D43F97',
            '#1E5D8C',
            '#421243',
            '#7F94B0',
            '#EF6537',
            '#C0ADDB',
          ],
          plotOptions: {
            treemap: {
              distributed: true,
              enableShades: false,
            },
          },
        };
        this.cdRef.detectChanges();
      })
    );
  }

  /**
   * This method will render drivers sessions
   */
  private getDriverSessionData() {
    this.subscriptionList.push(
      this.driverService.getDriverCount().subscribe((res: any) => {
        this.yearlyDrivers.set(res[0].total_drivers);
        this.yearlySessions.set(res[0].total_sessions);
        this.monthlyDrivers.set(res[0].current_month_drivers);
        this.monthlySessions.set(res[0].current_month_sessions);
      })
    );
  }

  /**
   * This method will render the line chart for trainer
   */
  private getTrainerSessionData() {
    this.subscriptionList.push(
      this.trainerService.getTrainerCount().subscribe((res: any) => {
        this.trainerCOpt = {
          series: res.series,
          chart: {
            type: 'bar',
            height: 350,
          },

          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '55%',
            },
          },
          dataLabels: {
            enabled: false,
          },
          colors: this.colors,
          stroke: {
            show: true,

            width: 1,
            colors: ['transparent'],
          },
          xaxis: {
            categories: res.categories,
          },
          yaxis: {
            title: {
              text: 'Total (assessments)',
            },
          },
          fill: {
            opacity: 1,
          },
          tooltip: {
            y: {
              formatter: function (val: any) {
                return val + ' assessments';
              },
            },
          },
        };
        this.cdRef.detectChanges();
      })
    );
  }
  /**
   * This method will render the pie chart for trainer
   */
  private getTrainerSessionPie() {
    this.subscriptionList.push(
      this.trainerService.getTrainerCount().subscribe((res: any) => {
        const trainerBarSeries = res.series;

        const pieSeries = trainerBarSeries.map((trainer: any) =>
          trainer.data.reduce(
            (sum: number, monthVal: number) => sum + monthVal,
            0
          )
        );

        const pieLabels = trainerBarSeries.map((trainer: any) => trainer.name);

        this.trainerPOpt = {
          series: pieSeries,
          chart: {
            type: 'pie',
            height: 350,
          },
          colors: this.colors,
          labels: pieLabels, // no labels shown outside
          legend: {
            show: false, // hides legend
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 300,
                },
                legend: {
                  position: 'bottom',
                },
              },
            },
          ],
        };
        this.cdRef.detectChanges();
      })
    );
  }

  /**
   * This method will fetch trainer name
   */
  public getTrainerName(item: number) {
    return this.utils.getGenericName(this.trainers(), item);
  }
  /**
   * This method will fetch client name
   */
  public getClientName(item: number) {
    return this.utils.getGenericName(this.clients(), item);
  }
  /**
   * This method will fetch contractor name
   */
  public getContractorName(item: number) {
    return this.utils.getGenericName(this.contractors(), item);
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
