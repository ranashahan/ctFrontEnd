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
import { Subscription } from 'rxjs';
import { UtilitiesService } from '../../Services/utilities.service';
import { LocationService } from '../../Services/location.service';
import { DriverService } from '../../Services/driver.service';
import { TrainerService } from '../../Services/trainer.service';
import { TrainingService } from '../../Services/training.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { ClientService } from '../../Services/client.service';
import { ContractorService } from '../../Services/contractor.service';

@Component({
  selector: 'app-dashboard',
  imports: [NgApexchartsModule, ToastComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('chart') chart!: ChartComponent;
  private trainingService = inject(TrainingService);
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
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    fill: ApexFill;
    stroke: ApexStroke;
    tooltip: ApexTooltip;
  };

  subscriptionList: Subscription[] = [];
  yearlyDrivers = signal<number>(0);
  monthlyDrivers = signal<number>(0);
  yearlySessions = signal<number>(0);
  monthlySessions = signal<number>(0);
  private trainers = this.trainerService.trainers;
  private clients = this.clientService.clients;
  private contractors = this.cService.contractors;
  private trainings = toSignal(this.trainingService.getAllTraining());
  public latestTrainings = computed(() => {
    const trainingsValue = this.trainings();
    if (!trainingsValue || trainingsValue.length === 0) {
      return []; // Return an empty array if trainings is undefined or empty
    }

    return [...trainingsValue].slice(0, 5);
  });

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
          text: 'Total (sessions)',
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val + ' sessions';
          },
        },
      },
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
    // this.getAllTrainings();
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
        const chartSeries = this.convertToSeries(res);
        this.trainerCOpt = {
          series: chartSeries,
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
              text: 'Total (sessions)',
            },
          },
          fill: {
            opacity: 1,
          },
          tooltip: {
            y: {
              formatter: function (val: any) {
                return val + ' sessions';
              },
            },
          },
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
   * This method for convert chart series
   * @param data chart data
   * @returns series data
   */
  private convertToSeries(data: TrainerData[]) {
    const seriesData = data.reduce((acc, item) => {
      // Find or create the series for each unique trainer
      let series = acc.find((s) => s.name === item.trainer_name);
      if (!series) {
        series = { name: item.trainer_name, data: [] };
        acc.push(series);
      }
      // Append session count to the trainer's data array
      series.data.push(item.session_count);
      return acc;
    }, [] as { name: string; data: number[] }[]);

    return seriesData;
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

interface TrainerData {
  trainer_name: string;
  year: number;
  month: number;
  session_count: number;
}
