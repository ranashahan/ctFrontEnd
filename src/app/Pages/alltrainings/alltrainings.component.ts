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
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { UtilitiesService } from '../../Services/utilities.service';
import { TrainingService } from '../../Services/training.service';
import { ClientService } from '../../Services/client.service';
import { ContractorService } from '../../Services/contractor.service';
import { TitleService } from '../../Services/title.service';
import { LocationService } from '../../Services/location.service';
import { TrainerService } from '../../Services/trainer.service';
import { apiTrainingModel } from '../../Models/Training';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { AgGridModule } from 'ag-grid-angular';

import {
  ColDef,
  DomLayoutType,
  GridApi,
  ValueFormatterParams,
} from 'ag-grid-community'; // Column Definition Type Interface
import 'ag-grid-community/styles/ag-grid.css';
/* Quartz Theme Specific CSS */
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { DatePipe } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TlinkCellRendererComponent } from '../../Components/tlink-cell-renderer/tlink-cell-renderer.component';
import { TActionCellRendererComponent } from '../../Components/taction-cell-renderer/taction-cell-renderer.component';
import { DeleteConfirmationComponent } from '../../Widgets/delete-confirmation/delete-confirmation.component';
import { CourseService } from '../../Services/course.service';
import { CategoryService } from '../../Services/category.service';
import { ROLES } from '../../Models/Constants';

@Component({
  selector: 'app-alltrainings',
  imports: [
    ToastComponent,
    ReactiveFormsModule,
    AgGridAngular,
    AgGridModule,
    RouterOutlet,
    RouterLink,
    DeleteConfirmationComponent,
  ],
  templateUrl: './alltrainings.component.html',
  styleUrl: './alltrainings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class AlltrainingsComponent implements OnInit, OnDestroy {
  @ViewChild(DeleteConfirmationComponent)
  deleteConfirmation!: DeleteConfirmationComponent;
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  private clientService = inject(ClientService);
  private cService = inject(ContractorService);
  private titleService = inject(TitleService);
  private locationService = inject(LocationService);
  private trainerService = inject(TrainerService);
  private trainingService = inject(TrainingService);
  private courseService = inject(CourseService);
  private categoryService = inject(CategoryService);

  trainings = signal<apiTrainingModel[]>([]);
  public trainingsWithNames =
    this.trainingService.getTrainingsWithContractorNames(this.trainings);
  initialValues: apiTrainingModel[] = [];
  contractors = this.cService.contractors;
  clients = this.clientService.clients;
  titles = this.titleService.titles;
  locations = this.locationService.locations;
  trainers = this.trainerService.trainers;
  categories = this.categoryService.categories;
  courses = this.courseService.courses;
  statuses = signal<string[]>([]);
  sources = signal<string[]>([]);
  selectedClient = signal<number | null>(null);
  isLoading = signal<boolean>(true);
  financeEnabled = signal<boolean>(false);

  filteredContractors = computed(() => {
    const clientid = this.selectedClient();
    return clientid
      ? this.contractors().filter(
          (c) => Number(c.clientid) === Number(clientid)
        )
      : this.contractors();
  });

  themeClass = signal<string>('ag-theme-quartz');
  gridApi!: GridApi;

  formTrainingSearch: FormGroup;

  constructor(
    private utils: UtilitiesService,
    private fb: FormBuilder,
    private authService: AuthService,
    private datePipe: DatePipe,
    private cdRef: ChangeDetectorRef
  ) {
    this.formTrainingSearch = this.fb.group({
      name: [],
      plandate: [],
      trainerid: [],
      clientid: [],
      locationid: [],
      contractorid: [],
      courseid: [],
      categoryid: [],
      invoicenumber: [],
      cheque: [],
      startDate: [this.utils.monthAgo(6).toISOString().substring(0, 10)],
      endDate: [this.utils.daysAhead(1).toISOString().substring(0, 10)],
    });
    this.formTrainingSearch
      .get('clientid')
      ?.valueChanges.subscribe((clientid) => {
        this.selectedClient.set(clientid);
      });
  }

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('All Trainings');
    this.statuses.set(this.utils.statuses());
    this.sources.set(this.utils.sources());
    this.updatetheme();
    this.getAllTrainings();
    const role = this.authService.getUserRole();
    if (role === ROLES.ADMIN || role === ROLES.DIRECTOR) {
      this.financeEnabled.set(true);
    }
  }

  /**
   * This method will fetch all the training records against selected filters
   */
  public getFillterredData(): void {
    this.subscriptionList.push(
      this.trainingService
        .getTrainingbydate(
          this.formTrainingSearch.value.name,
          this.formTrainingSearch.value.plandate,
          this.formTrainingSearch.value.courseid,
          this.formTrainingSearch.value.categoryid,
          this.formTrainingSearch.value.clientid,
          this.formTrainingSearch.value.contractorid,
          this.formTrainingSearch.value.invoicenumber,
          this.formTrainingSearch.value.cheque,
          this.formTrainingSearch.value.startDate,
          this.formTrainingSearch.value.endDate
        )

        .subscribe({
          next: (res: any) => {
            this.trainings.set(res);
          },
          error: (err) => {
            this.utils.showToast(
              'Could not find any record, please update your filter',
              'warning'
            );
          },
        })
    );
  }

  /**
   * This method will fetch all the trainings
   */
  private getAllTrainings(): void {
    this.subscriptionList.push(
      this.trainingService
        .getTrainingbydate(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          this.formTrainingSearch.value.startDate,
          this.formTrainingSearch.value.endDate
        )
        .subscribe((res: any) => {
          this.trainings.set(res);
          // console.log(this.trainings());
          this.initialValues = res;
          this.isLoading.set(false);
        })
    );
  }

  /**
   * This method will delete the training and remove all the relevent records
   * @param id number sessionid
   */
  public async deleteTraining(id: number) {
    const isConfirmed = await this.deleteConfirmation.openModal(
      'Training: ' + id
    );
    if (isConfirmed)
      this.subscriptionList.push(
        this.trainingService.deleteTrainingByID(id).subscribe({
          next: (res: any) => {
            this.utils.showToast(
              `Training ID: ${id} has been deleted successfully`,
              'success'
            );
            this.getAllTrainings();
          },
          error: (err: any) => {
            this.utils.showToast(err.message, 'error');
          },
        })
      );
  }

  /**
   * This is table columns definations
   */

  colDefs: ColDef[] = [
    // {
    //   headerName: '#',
    //   valueGetter: 'node.rowIndex + 1', // Add 1 to make it 1-based index
    //   cellClass: 'serial-number-cell',
    //   width: 50, // Set to a small but visible width in pixels
    //   maxWidth: 50, // Enforce a maximum width
    //   minWidth: 30, // Optionally enforce a minimum width
    //   headerTooltip: 'Sr. #',
    // },
    // {
    //   headerName: 'Training ID',
    //   field: 'name',
    //   filter: 'agTextColumnFilter',
    //   cellRenderer: 'tlinkCellRendererComponent',
    //   flex: 1.5,
    //   headerClass: 'bold-header',
    //   headerTooltip: 'Training ID',
    // },
    // {
    //   headerName: 'Plan Date',
    //   field: 'plandate',
    //   valueGetter: (params) =>
    //     params.data.plandate ? new Date(params.data.plandate) : null,
    //   valueFormatter: (params) =>
    //     this.datePipe.transform(params.value, 'MM-dd-yyyy') || '',
    //   filter: 'agDateColumnFilter',
    //   headerTooltip: 'Plan Date',
    // },
    // {
    //   headerName: 'End Date',
    //   field: 'enddate',
    //   valueGetter: (params) =>
    //     params.data.enddate ? new Date(params.data.enddate) : null,
    //   valueFormatter: (params) =>
    //     this.datePipe.transform(params.value, 'MM-dd-yyyy') || '',
    //   filter: 'agDateColumnFilter',
    //   headerTooltip: 'End Date',
    // },
    // {
    //   headerName: 'Trainer',
    //   field: 'trainerName',
    //   filter: 'agTextColumnFilter',
    //   headerTooltip: 'Trainers',
    // },
    // {
    //   headerName: 'Course Title',
    //   field: 'courseName',
    //   filter: 'agTextColumnFilter',
    //   flex: 1.5,
    //   headerTooltip: 'Courses',
    // },
    // {
    //   headerName: 'Sponsor',
    //   field: 'clientName',
    //   filter: 'agTextColumnFilter',
    //   headerTooltip: 'Clients',
    // },
    // {
    //   headerName: 'Contractor',
    //   field: 'contractorName',
    //   filter: 'agTextColumnFilter',
    //   headerTooltip: 'Contractors',
    // },
    // // {
    // //   headerName: 'Total',
    // //   field: 'total',
    // //   filter: 'agNumberColumnFilter',
    // //   valueFormatter: (params) => {
    // //     // Check for null or undefined values
    // //     return params.value != null ? `Rs. ${params.value}` : ''; // Show empty string if null
    // //   },
    // //   headerTooltip: 'Total Amount',
    // // },
    // // {
    // //   headerName: 'Received',
    // //   field: 'amountreceived',
    // //   filter: 'agNumberColumnFilter',
    // //   valueFormatter: (params) => {
    // //     // Check for null or undefined values
    // //     return params.value != null ? `Rs. ${params.value}` : ''; // Show empty string if null
    // //   },
    // //   headerTooltip: 'Received Amount',
    // // },
    // {
    //   headerName: 'Status',
    //   field: 'status',
    //   filter: 'agTextColumnFilter',
    //   headerTooltip: 'Job Status',
    // },
    // {
    //   headerName: 'Actions',
    //   field: 'actions',
    //   cellRenderer: 'actionCellRenderer',
    //   cellRendererParams: {
    //     onDelete: this.deleteTraining.bind(this),
    //   },
    //   editable: false,
    //   sortable: false,
    // },
  ];

  loadColumnDefs() {
    this.colDefs = [
      {
        headerName: '#',
        valueGetter: 'node.rowIndex + 1', // Add 1 to make it 1-based index
        cellClass: 'serial-number-cell',
        width: 50, // Set to a small but visible width in pixels
        maxWidth: 50, // Enforce a maximum width
        minWidth: 30, // Optionally enforce a minimum width
        headerTooltip: 'Sr. #',
      },
      {
        headerName: 'Training ID',
        field: 'name',
        filter: 'agTextColumnFilter',
        cellRenderer: 'tlinkCellRendererComponent',
        flex: 1.5,
        headerClass: 'bold-header',
        headerTooltip: 'Training ID',
      },
      {
        headerName: 'Plan Date',
        field: 'plandate',
        valueGetter: (params) =>
          params.data.plandate ? new Date(params.data.plandate) : null,
        valueFormatter: (params) =>
          this.datePipe.transform(params.value, 'MM-dd-yyyy') || '',
        filter: 'agDateColumnFilter',
        headerTooltip: 'Plan Date',
      },
      {
        headerName: 'End Date',
        field: 'enddate',
        valueGetter: (params) =>
          params.data.enddate ? new Date(params.data.enddate) : null,
        valueFormatter: (params) =>
          this.datePipe.transform(params.value, 'MM-dd-yyyy') || '',
        filter: 'agDateColumnFilter',
        headerTooltip: 'End Date',
      },
      {
        headerName: 'Trainer',
        field: 'trainerName',
        filter: 'agTextColumnFilter',
        headerTooltip: 'Trainers',
      },
      {
        headerName: 'Course Title',
        field: 'courseName',
        filter: 'agTextColumnFilter',
        flex: 1.5,
        headerTooltip: 'Courses',
      },
      {
        headerName: 'Sponsor',
        field: 'clientName',
        filter: 'agTextColumnFilter',
        headerTooltip: 'Clients',
      },
      {
        headerName: 'Contractor',
        field: 'contractorName',
        filter: 'agTextColumnFilter',
        headerTooltip: 'Contractors',
      },
      // {
      //   headerName: 'Total',
      //   field: 'total',
      //   filter: 'agNumberColumnFilter',
      //   valueFormatter: (params) => {
      //     // Check for null or undefined values
      //     return params.value != null ? `Rs. ${params.value}` : ''; // Show empty string if null
      //   },
      //   headerTooltip: 'Total Amount',
      // },
      // {
      //   headerName: 'Received',
      //   field: 'amountreceived',
      //   filter: 'agNumberColumnFilter',
      //   valueFormatter: (params) => {
      //     // Check for null or undefined values
      //     return params.value != null ? `Rs. ${params.value}` : ''; // Show empty string if null
      //   },
      //   headerTooltip: 'Received Amount',
      // },
      {
        headerName: 'Status',
        field: 'status',
        filter: 'agTextColumnFilter',
        headerTooltip: 'Job Status',
      },
      {
        headerName: 'Actions',
        field: 'actions',
        cellRenderer: 'actionCellRenderer',
        cellRendererParams: {
          onDelete: this.deleteTraining.bind(this),
        },
        editable: false,
        sortable: false,
      },
    ];

    const statusIndex = this.colDefs.findIndex((col) => col.field === 'status');
    if (this.financeEnabled()) {
      const extraColumns: ColDef[] = [
        {
          headerName: 'Total',
          field: 'total',
          filter: 'agNumberColumnFilter',
          valueFormatter: (params: ValueFormatterParams) =>
            params.value != null ? `Rs. ${params.value}` : '',
          headerTooltip: 'Total Amount',
        },
        {
          headerName: 'Received',
          field: 'amountreceived',
          filter: 'agNumberColumnFilter',
          valueFormatter: (params: ValueFormatterParams) =>
            params.value != null ? `Rs. ${params.value}` : '',
          headerTooltip: 'Received Amount',
        },
      ];

      // Insert before status
      this.colDefs.splice(statusIndex, 0, ...extraColumns);
    }
  }

  /**
   * Default column defination
   */
  defaultColDef = {
    flex: 1,
    minWidth: 80,
    editable: true,
    resizable: true,
  };

  /**
   * Components
   */
  components = {
    tlinkCellRendererComponent: TlinkCellRendererComponent,
    actionCellRenderer: TActionCellRendererComponent,
  };

  /**
   * Filter text box
   */
  public onFilterTextBoxChanged(): void {
    this.gridApi.setGridOption(
      'quickFilterText',
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  /**
   * Update Theme
   */
  private updatetheme(): void {
    const themeName = this.authService.getUserTheme();
    if (themeName === 'dark') {
      this.themeClass.set('ag-theme-quartz-dark');
    }
  }

  /**
   * This method is checking grid ready state
   * @param params Params
   */
  onGridReady(params: any) {
    this.gridApi = params.api;
    this.loadColumnDefs();
  }

  /**
   * Grid options
   */
  gridOptions = {
    components: this.components,
    context: {
      onDelete: this.deleteTraining.bind(this),
    },
    rowHeight: 40,
    domLayout: 'autoHeight' as DomLayoutType,
  };

  /**
   * This method for row style
   * @param params RowStyles
   * @returns row styles
   */
  public getRowStyle = (params: any) => {
    switch (params.data.status) {
      case 'Tentative': // Red Theme
        return { background: '#f8d7da', color: '#842029' };
      case 'Planned': // Yellow Theme
        return { background: '#fff3cd', color: '#856404' };
      case 'Conducted': // Blue Theme
        return { background: '#cfe2ff', color: '#084298' };
      case 'Billed': // Green Theme
        return { background: '#d1e7dd', color: '#0f5132' };
      default: // Return undefined for other cases
        return undefined;
    }
  };

  /**
   * Grid filter resets
   */
  resetFilters() {
    this.gridApi.setFilterModel(null);
  }

  /**
   * Export to excel
   */
  executeExport() {
    this.gridApi.exportDataAsCsv();
  }

  /**
   * Form reset
   */
  formRest() {
    this.formTrainingSearch.reset({
      name: '',
      sessiondate: null,
      locationid: null,
      contractorid: null,
      nic: '',
      resultid: null,
      stageid: null,
      startDate: this.utils.monthAgo(6).toISOString().substring(0, 10),
      endDate: this.utils.daysAhead(1).toISOString().substring(0, 10),
    });
    this.trainings.set(this.initialValues);
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
