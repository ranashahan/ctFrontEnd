import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { DeleteConfirmationComponent } from '../../Widgets/delete-confirmation/delete-confirmation.component';
import { Subscription } from 'rxjs';
import { apiSessionModel } from '../../Models/Assessment';
import { apiContractorModel } from '../../Models/Contractor';
import { apiGenericModel } from '../../Models/Generic';
import { UtilitiesService } from '../../Services/utilities.service';
import { AssessmentService } from '../../Services/assessment.service';
import { ContractorService } from '../../Services/contractor.service';
import { LocationService } from '../../Services/location.service';
import { StageService } from '../../Services/stage.service';
import { ResultService } from '../../Services/result.service';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { AgGridModule } from 'ag-grid-angular';

import { ColDef, DomLayoutType, GridApi } from 'ag-grid-community'; // Column Definition Type Interface
import 'ag-grid-community/styles/ag-grid.css';
/* Quartz Theme Specific CSS */
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AuthService } from '../../Services/auth.service';
import { SDLinkCellRendererComponent } from '../../Components/sdlink-cell-renderer/sdlink-cell-renderer.component';
import { SLinkCellRendererComponent } from '../../Components/slink-cell-renderer/slink-cell-renderer.component';
import { SActionCellRendererComponent } from '../../Components/saction-cell-renderer/saction-cell-renderer.component';
@Component({
  selector: 'app-allassessments',
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ToastComponent,
    DeleteConfirmationComponent,
    AgGridAngular,
    AgGridModule,
  ],
  templateUrl: './allassessments.component.html',
  styleUrl: './allassessments.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class AllassessmentsComponent implements OnInit, OnDestroy {
  @ViewChild(DeleteConfirmationComponent)
  deleteConfirmation!: DeleteConfirmationComponent;
  sessions = signal<apiSessionModel[]>([]);
  subscriptionList: Subscription[] = [];
  initialValues: apiSessionModel[] = [];
  contractors = signal<apiContractorModel[]>([]);
  locations = signal<apiGenericModel[]>([]);
  results = signal<apiGenericModel[]>([]);
  stages = signal<apiGenericModel[]>([]);

  gridApi!: GridApi;

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

  formSession: FormGroup;

  constructor(
    private utils: UtilitiesService,
    private assessmentService: AssessmentService,
    private fb: FormBuilder,
    private cService: ContractorService,
    private lService: LocationService,
    private sService: StageService,
    private rService: ResultService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) {
    this.utils.setTitle('All Assessments');

    this.formSession = this.fb.group({
      name: [''],
      sessiondate: [null],
      locationid: [null],
      contractorid: [null],
      drivername: [''],
      nic: [''],
      resultid: [null],
      stageid: [null],
      startDate: [this.oneMonthAgo.toISOString().substring(0, 10)],
      endDate: [this.oneMonthAhead.toISOString().substring(0, 10)],
    });
  }

  ngOnInit(): void {
    this.getAllSessionsByDate();
    this.getContractors();
    this.getLocations();
    this.getResults();
    this.getStages();
    this.updatetheme();
  }

  getAllSessionsByDate() {
    this.subscriptionList.push(
      this.assessmentService
        .getSessionsWithOthersName(
          this.assessmentService.getSessionbydate(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            this.formSession.value.startDate,
            this.formSession.value.endDate
          )
        )
        .subscribe((res: any) => {
          this.sessions.set(res);
          //console.log(this.sessions());
          this.initialValues = res;
        })
    );
  }

  /**
   * This method will fetch contractors
   */
  getContractors() {
    this.subscriptionList.push(
      this.cService.getAll().subscribe((res: any) => {
        this.contractors.set(res);
      })
    );
  }
  getLocations() {
    this.subscriptionList.push(
      this.lService.getAllLocations().subscribe((res: any) => {
        this.locations.set(res);
      })
    );
  }
  getStages() {
    this.subscriptionList.push(
      this.sService.getAllStages().subscribe((res: any) => {
        this.stages.set(res);
      })
    );
  }
  getResults() {
    this.subscriptionList.push(
      this.rService.getAllResults().subscribe((res: any) => {
        this.results.set(res);
      })
    );
  }

  viewAssessmentDetails(id: number): void {
    // Navigate to the driver detail page
    this.router.navigate([`/allassessments/${id}`], { relativeTo: this.route });
  }

  /**
   * This method will delete the session and remove all the relevent records
   * @param id number sessionid
   */
  async deleteAssessment(id: number) {
    const isConfirmed = await this.deleteConfirmation.openModal(
      'assessment: ' + id
    );
    if (isConfirmed)
      this.subscriptionList.push(
        this.assessmentService.deleteSessionByID(id).subscribe((res: any) => {
          this.utils.showToast(
            `Assessment ID: ${id} has been deleted successfully`,
            'success'
          );
          this.getAllSessionsByDate();
          this.cdRef.detectChanges();
        })
      );
  }

  getStageName(itemId: number): string {
    return this.utils.getGenericName(this.stages(), itemId);
  }
  getResultName(itemId: number): string {
    return this.utils.getGenericName(this.results(), itemId);
  }
  getLocationName(itemId: number): string {
    return this.utils.getGenericName(this.locations(), itemId);
  }
  getContractorName(itemId: number): string {
    return this.utils.getGenericName(this.contractors(), itemId);
  }

  getFillterredData() {
    this.subscriptionList.push(
      this.assessmentService
        .getSessionsWithOthersName(
          this.assessmentService.getSessionbydate(
            this.formSession.value.nic,
            this.formSession.value.name,
            this.formSession.value.sessiondate,
            this.formSession.value.contractorid,
            this.formSession.value.resultid,
            this.formSession.value.stageid,
            this.formSession.value.locationid,
            this.formSession.value.startDate,
            this.formSession.value.endDate
          )
        )
        .subscribe({
          next: (res: any) => {
            this.sessions.set(res);
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
      headerName: 'Session ID',
      field: 'name',
      filter: 'agTextColumnFilter',
      cellRenderer: 'slinkCellRendererComponent',
      flex: 1.5,
      headerClass: 'bold-header',
    },
    {
      headerName: 'Session Date',
      field: 'sessiondate',
      valueGetter: (params) =>
        params.data.sessiondate ? new Date(params.data.sessiondate) : null,
      valueFormatter: (params) =>
        this.datePipe.transform(params.value, 'MM-dd-yyyy') || '',
      filter: 'agDateColumnFilter',
      headerTooltip: 'Session Date',
    },
    {
      headerName: 'Driver Name',
      field: 'drivername',
      filter: 'agTextColumnFilter',
      cellRenderer: 'sdLinkCellRendererComponent',
      flex: 1.5,
    },
    {
      headerName: 'Contractor',
      field: 'contractorName',
      filter: 'agTextColumnFilter',
      flex: 1.5,
    },
    {
      headerName: 'Location',
      field: 'locationName',
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Result',
      field: 'resultName',
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Stage',
      field: 'stageName',
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Score',
      field: 'totalscore',
      filter: 'agNumberColumnFilter',
    },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: 'actionCellRenderer',
      cellRendererParams: {
        onDelete: this.deleteAssessment.bind(this),
      },
      editable: false,
      sortable: false,
    },
  ];

  defaultColDef = {
    flex: 1,
    minWidth: 80,
    editable: true,
    resizable: true,
  };

  components = {
    sdLinkCellRendererComponent: SDLinkCellRendererComponent,
    slinkCellRendererComponent: SLinkCellRendererComponent,
    actionCellRenderer: SActionCellRendererComponent,
  };

  onFilterTextBoxChanged() {
    this.gridApi.setGridOption(
      'quickFilterText',
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  public themeClass: string = 'ag-theme-quartz';

  updatetheme() {
    const themeName = this.authService.getUserTheme();
    if (themeName === 'dark') {
      this.themeClass += '-dark';
    }
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  gridOptions = {
    components: this.components,
    context: {
      onDelete: this.deleteAssessment.bind(this),
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

  executeExport() {
    this.gridApi.exportDataAsCsv();
  }

  formRest() {
    this.formSession.reset({
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
    this.sessions.set(this.initialValues);
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
