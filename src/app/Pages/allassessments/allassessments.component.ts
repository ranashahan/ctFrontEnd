import { CommonModule, DatePipe } from '@angular/common';
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
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { DeleteConfirmationComponent } from '../../Widgets/delete-confirmation/delete-confirmation.component';
import { Subscription } from 'rxjs';
import { apiSessionModel } from '../../Models/Assessment';
import { UtilitiesService } from '../../Services/utilities.service';
import { AssessmentService } from '../../Services/assessment.service';
import { ContractorService } from '../../Services/contractor.service';
import { LocationService } from '../../Services/location.service';
import { StageService } from '../../Services/stage.service';
import { ResultService } from '../../Services/result.service';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { AgGridModule } from 'ag-grid-angular';

import {
  ColDef,
  DomLayoutType,
  GridApi,
  RowClassParams,
  RowStyle,
} from 'ag-grid-community'; // Column Definition Type Interface
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

  private authService = inject(AuthService);

  private utils = inject(UtilitiesService);
  private cService = inject(ContractorService);
  private locationService = inject(LocationService);
  private resultService = inject(ResultService);
  private stageService = inject(StageService);
  private assessmentService = inject(AssessmentService);

  sessions = signal<apiSessionModel[]>([]);
  subscriptionList: Subscription[] = [];
  initialValues: apiSessionModel[] = [];
  contractors = this.cService.contractors;
  locations = this.locationService.locations;
  results = this.resultService.results;
  stages = this.stageService.stages;
  sessionsWithName = this.assessmentService.getSessionsWithNames(this.sessions);
  public themeClass = signal<string>('ag-theme-quartz');
  gridApi!: GridApi;
  isLoading = signal<boolean>(true);

  formSession: FormGroup;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private cdRef: ChangeDetectorRef
  ) {
    this.formSession = this.fb.group({
      name: [''],
      sessiondate: [null],
      locationid: [null],
      contractorid: [null],
      drivername: [''],
      nic: [''],
      resultid: [null],
      stageid: [null],
      startDate: [this.utils.monthAgo(3).toISOString().substring(0, 10)],
      endDate: [this.utils.daysAhead(1).toISOString().substring(0, 10)],
    });
  }

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('All Assessments');
    this.getAllSessionsByDate();
    this.updatetheme();
  }

  /**
   * This method will get all standard sessions.
   */
  private getAllSessionsByDate(): void {
    this.subscriptionList.push(
      this.assessmentService
        .getSessionbydate(
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
        .subscribe((res: any) => {
          this.sessions.set(res);
          this.initialValues = res;
          this.isLoading.set(false);
        })
    );
  }

  /**
   * This method will delete the session and remove all the relevent records
   * @param id number sessionid
   */
  public async deleteAssessment(id: number) {
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

  /**
   * This method will fetch name against number
   * @param itemId item number
   * @returns {string} item name
   */
  public getStageName(itemId: number): string {
    return this.utils.getGenericName(this.stages(), itemId);
  }

  /**
   * This method will fetch name against number
   * @param itemId item number
   * @returns {string} item name
   */
  public getResultName(itemId: number): string {
    return this.utils.getGenericName(this.results(), itemId);
  }

  /**
   * This method will fetch name against number
   * @param itemId item number
   * @returns {string} item name
   */
  public getLocationName(itemId: number): string {
    return this.utils.getGenericName(this.locations(), itemId);
  }
  /**
   * This method will fetch name against number
   * @param itemId item number
   * @returns {string} item name
   */
  public getContractorName(itemId: number): string {
    return this.utils.getGenericName(this.contractors(), itemId);
  }

  /**
   * This method will update filter data
   */
  public getFillterredData(): void {
    this.subscriptionList.push(
      this.assessmentService
        .getSessionbydate(
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

        .subscribe({
          next: (res: any) => {
            if (res) {
              this.sessions.set(res);
            } else {
              this.utils.showToast('No contact found', 'warning');
            }
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
   * This is session table columns definations
   */
  colDefs: ColDef[] = [
    {
      headerName: '#',
      valueGetter: 'node.rowIndex + 1', // Add 1 to make it 1-based index
      cellClass: 'serial-number-cell',
      headerTooltip: 'Sr. #',
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
      headerTooltip: 'Session ID',
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
      headerTooltip: 'Driver Name',
    },
    {
      headerName: 'Contractor',
      field: 'contractorName',
      filter: 'agTextColumnFilter',
      flex: 1.5,
      headerTooltip: 'Session Contractor',
    },
    {
      headerName: 'Location',
      field: 'locationName',
      filter: 'agTextColumnFilter',
      headerTooltip: 'Location',
    },
    {
      headerName: 'Result',
      field: 'resultName',
      filter: 'agTextColumnFilter',
      headerTooltip: 'Result',
    },
    {
      headerName: 'Stage',
      field: 'stageName',
      filter: 'agTextColumnFilter',
      headerTooltip: 'Stage',
    },
    {
      headerName: 'Score',
      field: 'totalscore',
      filter: 'agNumberColumnFilter',
      headerTooltip: 'Total Score',
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

  /**
   * This method will update filter
   */
  public onFilterTextBoxChanged(): void {
    this.gridApi.setGridOption(
      'quickFilterText',
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  /**
   * This method will update theme
   */
  private updatetheme(): void {
    const themeName = this.authService.getUserTheme();
    if (themeName === 'dark') {
      this.themeClass.set('ag-theme-quartz-dark');
    }
  }

  /**
   * This method will ready rows of ag-grid
   * @param params grid event
   */
  public onGridReady(params: any) {
    this.gridApi = params.api;
  }

  /**
   * This method for row styles
   * @param params RowStyles
   * @returns row styles
   */
  public getRowStyle = (params: RowClassParams): RowStyle | undefined => {
    if (!params.data || params.data.totalscore == null) return undefined; // Ensure data exists

    if (params.data.totalscore === 0) {
      return this.expiredRowStyle;
    }

    return undefined; // Default style for other rows.
  };

  private expiredRowStyle: RowStyle = {
    background: '#f8d7da',
    color: '#842029',
  };

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
  public resetFilters(): void {
    this.gridApi.setFilterModel(null);
  }

  /**
   * This method for download excel
   */
  public executeExport() {
    this.gridApi.exportDataAsCsv();
  }

  /**
   * This method for reset the search form
   */
  public formRest() {
    this.formSession.reset({
      name: '',
      sessiondate: null,
      locationid: null,
      contractorid: null,
      nic: '',
      resultid: null,
      stageid: null,
      startDate: [this.utils.monthAgo(3).toISOString().substring(0, 10)],
      endDate: [this.utils.daysAhead(1).toISOString().substring(0, 10)],
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
