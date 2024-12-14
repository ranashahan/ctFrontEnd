import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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
import { apiGenericModel } from '../../Models/Generic';
import { apiTrainerModel } from '../../Models/Trainer';
import { AuthService } from '../../Services/auth.service';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { AgGridModule } from 'ag-grid-angular';

import { ColDef, DomLayoutType, GridApi } from 'ag-grid-community'; // Column Definition Type Interface
import 'ag-grid-community/styles/ag-grid.css';
/* Quartz Theme Specific CSS */
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { DatePipe } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TlinkCellRendererComponent } from '../../Components/tlink-cell-renderer/tlink-cell-renderer.component';
import { TActionCellRendererComponent } from '../../Components/taction-cell-renderer/taction-cell-renderer.component';
import { DeleteConfirmationComponent } from '../../Widgets/delete-confirmation/delete-confirmation.component';

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

  trainings = signal<apiTrainingModel[]>([]);
  public trainingsWithNames =
    this.trainingService.getTrainingsWithContractorNames(this.trainings);
  initialValues: apiTrainingModel[] = [];
  contractors = this.cService.contractors;
  clients = this.clientService.clients;
  titles = this.titleService.titles;
  locations = this.locationService.locations;
  trainers = this.trainerService.trainers;
  categories = signal<string[]>([]);
  cources = signal<string[]>([]);
  statuses = signal<string[]>([]);
  sources = signal<string[]>([]);
  themeClass = signal<string>('ag-theme-quartz');
  gridApi!: GridApi;

  formTrainingSearch: FormGroup;

  today = new Date();
  oneMonthAgo = new Date(
    this.today.getFullYear(),
    this.today.getMonth() - 1,
    this.today.getDate()
  );
  oneMonthAhead = new Date(
    this.today.getFullYear(),
    this.today.getMonth(),
    this.today.getDate() + 1
  );

  constructor(
    private utils: UtilitiesService,
    private fb: FormBuilder,
    private authService: AuthService,
    private datePipe: DatePipe,
    private cdRef: ChangeDetectorRef
  ) {
    this.utils.setTitle('All Trainings');
    this.formTrainingSearch = this.fb.group({
      name: [],
      plandate: [],
      trainerid: [],
      clientid: [],
      locationid: [],
      contractorid: [],
      cource: [],
      category: [],
      startDate: [this.oneMonthAgo.toISOString().substring(0, 10)],
      endDate: [this.oneMonthAhead.toISOString().substring(0, 10)],
    });
  }

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.categories.set(this.utils.categories());
    this.cources.set(this.utils.cources());
    this.statuses.set(this.utils.statuses());
    this.sources.set(this.utils.sources());
    this.updatetheme();
    this.getAllTrainings();
  }

  /**
   * This method will fetch all the training records against selected filters
   */
  getFillterredData() {
    this.subscriptionList.push(
      this.trainingService
        .getSessionbydate(
          this.formTrainingSearch.value.name,
          this.formTrainingSearch.value.plandate,
          this.formTrainingSearch.value.cource,
          this.formTrainingSearch.value.category,
          this.formTrainingSearch.value.clientid,
          this.formTrainingSearch.value.contractorid,
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
  getAllTrainings() {
    this.subscriptionList.push(
      this.trainingService.getAllTraining().subscribe((res: any) => {
        this.trainings.set(res);
        // console.log(this.trainings());
        this.initialValues = res;
      })
    );
  }

  /**
   * This method will delete the training and remove all the relevent records
   * @param id number sessionid
   */
  async deleteTraining(id: number) {
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
    {
      headerName: '#',
      valueGetter: 'node.rowIndex + 1', // Add 1 to make it 1-based index
      cellClass: 'serial-number-cell',
      width: 50, // Set to a small but visible width in pixels
      maxWidth: 50, // Enforce a maximum width
      minWidth: 30, // Optionally enforce a minimum width
    },
    {
      headerName: 'Training ID',
      field: 'name',
      filter: 'agTextColumnFilter',
      cellRenderer: 'tlinkCellRendererComponent',
      flex: 1.5,
      headerClass: 'bold-header',
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
      headerName: 'Course Title',
      field: 'cource',
      filter: 'agTextColumnFilter',
      flex: 1.5,
    },
    {
      headerName: 'Category',
      field: 'category',
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Client',
      field: 'clientName',
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Contractor',
      field: 'contractorName',
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Total Amount',
      field: 'total',
      filter: 'agNumberColumnFilter',
    },
    {
      headerName: 'Received Amount',
      field: 'amountreceived',
      filter: 'agNumberColumnFilter',
    },
    {
      headerName: 'Job Status',
      field: 'status',
      filter: 'agTextColumnFilter',
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
  onFilterTextBoxChanged() {
    this.gridApi.setGridOption(
      'quickFilterText',
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  /**
   * Update Theme
   */
  updatetheme() {
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
      startDate: this.oneMonthAgo.toISOString().substring(0, 10),
      endDate: this.oneMonthAhead.toISOString().substring(0, 10),
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
