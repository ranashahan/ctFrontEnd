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
import { Subscription } from 'rxjs';
import { DeleteConfirmationComponent } from '../../Widgets/delete-confirmation/delete-confirmation.component';
import { apiDriverModel } from '../../Models/Driver';
import { apiContractorModel } from '../../Models/Contractor';
import { apiGenericModel } from '../../Models/Generic';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DriverService } from '../../Services/driver.service';
import { UtilitiesService } from '../../Services/utilities.service';
import { ContractorService } from '../../Services/contractor.service';
import { DltypeService } from '../../Services/dltype.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { AuthService } from '../../Services/auth.service';
import { LinkCellRendererComponent } from '../../Components/link-cell-renderer/link-cell-renderer.component';
import { ActionCellRendererComponent } from '../../Components/action-cell-renderer/action-cell-renderer.component';
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
@Component({
  selector: 'app-alldrivers',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    DeleteConfirmationComponent,
    ToastComponent,
    AgGridAngular,
    AgGridModule,
  ],
  templateUrl: './alldrivers.component.html',
  styleUrl: './alldrivers.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class AlldriversComponent implements OnInit, OnDestroy {
  @ViewChild(DeleteConfirmationComponent)
  deleteConfirmation!: DeleteConfirmationComponent;

  private driverService = inject(DriverService);
  private utils = inject(UtilitiesService);
  private cService = inject(ContractorService);
  private dltypeService = inject(DltypeService);
  private authService = inject(AuthService);

  gridApi!: GridApi;
  drivers = signal<apiDriverModel[]>([]);
  initialValues: apiDriverModel[] = [];
  contractors = this.cService.contractors;
  dltypes = this.dltypeService.dltypes;
  driversWithName = this.driverService.getDriversWithNames(this.drivers);
  subscriptionList: Subscription[] = [];

  formSaveDrivers = new FormGroup({
    name: new FormControl(),
    nic: new FormControl(),
    licensenumber: new FormControl(),
    permitnumber: new FormControl(),
    permitexpiry: new FormControl(),
    contractorid: new FormControl(),
  });

  constructor(private datePipe: DatePipe, private cdRef: ChangeDetectorRef) {}

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('All Drivers');
    this.updatetheme();
    this.getAll();
  }

  /**
   * This method will filter the drivers
   */
  getFillterredData() {
    this.subscriptionList.push(
      this.driverService
        .searchDrivers(
          this.formSaveDrivers.value.nic,
          this.formSaveDrivers.value.licensenumber,
          this.formSaveDrivers.value.name,
          this.formSaveDrivers.value.contractorid,
          this.formSaveDrivers.value.permitexpiry,
          this.formSaveDrivers.value.permitnumber
        )
        .subscribe({
          next: (res) => {
            if (res) {
              this.drivers.set(res);
            } else {
              this.utils.showToast('No content found', 'warning');
            }
          },
          error: (err) => {
            this.utils.showToast(
              'Could not found any record, please change your search criteria',
              'warning'
            );
          },
        })
    );
  }

  /**
   * This method will get all the drivers
   */
  getAll() {
    this.subscriptionList.push(
      this.driverService.getAllDrivers().subscribe((res: any) => {
        this.drivers.set(res);
        this.initialValues = res;
      })
    );
  }

  /**
   * This method will delete driver
   * @param id number driver id
   */
  async deleteDriver(id: number) {
    // Open confirmation modal and wait for response
    const isConfirmed = await this.deleteConfirmation.openModal(
      'driver: ' + id
    );

    // Only proceed with delete if the user confirmed
    if (isConfirmed) {
      this.subscriptionList.push(
        this.driverService.deleteDriverByID(id).subscribe({
          next: (data) => {
            this.utils.showToast('Driver deleted successfully', 'success');
            this.getAll();
          },
          error: (err) => {
            this.utils.showToast(err.message, 'error');
          },
        })
      );
    }
  }

  /**
   * This method will export to excel
   */
  executeExport() {
    this.gridApi.exportDataAsCsv();
  }

  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formSaveDrivers.reset();
    this.drivers.set(this.initialValues);
  }
  /**
   * This method will convert id into name
   * @param contractorId number contractor id
   * @returns string name
   */
  getContractorName(contractorId: number): string {
    return this.utils.getGenericName(this.contractors(), contractorId);
  }

  /**
   * This method will convert id into name
   * @param dlTypeId number driver license type id
   * @returns string name
   */
  getDLTypesName(dlTypeId: number): string {
    return this.utils.getGenericName(this.dltypes(), dlTypeId);
  }

  components = {
    linkCellRenderer: LinkCellRendererComponent,
    actionCellRenderer: ActionCellRendererComponent,
  };

  colDefs: ColDef[] = [
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
      headerName: 'ID',
      field: 'id',
      filter: 'agNumberColumnFilter',
      flex: 0.2,
      headerTooltip: 'Driver ID',
    },
    {
      headerName: 'Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      cellRenderer: 'linkCellRenderer',
      flex: 1.5,
      headerTooltip: 'Driver Name',
    },
    {
      headerName: 'Contractor',
      field: 'contractorName',
      filter: 'agTextColumnFilter',
      flex: 1.5,
      headerTooltip: 'Contractor Name',
    },
    {
      headerName: 'N.I.C #',
      field: 'nic',
      filter: 'agTextColumnFilter',
      flex: 1.5,
      headerTooltip: 'National Identity Card #',
    },
    {
      headerName: 'DL #',
      field: 'licensenumber',
      filter: 'agTextColumnFilter',
      headerTooltip: 'Driver License Number',
    },
    {
      headerName: 'DL-Type',
      field: 'licensetypeName',
      filter: 'agTextColumnFilter',
      headerTooltip: 'Driver License Type',
    },
    {
      headerName: 'DL-Expiry',
      field: 'licenseexpiry',
      valueGetter: (params) =>
        params.data.licenseexpiry ? new Date(params.data.licenseexpiry) : null,
      valueFormatter: (params) =>
        this.datePipe.transform(params.value, 'MM-dd-yyyy') || '',
      filter: 'agDateColumnFilter',
      headerTooltip: 'Driver License Expiry',
    },
    {
      headerName: 'Permit #',
      field: 'permitnumber',
      filter: 'agTextColumnFilter',
      headerTooltip: 'Permit Number',
    },
    {
      headerName: 'P-Issue',
      field: 'permitissue',
      valueGetter: (params) =>
        params.data.permitissue ? new Date(params.data.permitissue) : null,
      valueFormatter: (params) =>
        this.datePipe.transform(params.value, 'MM-dd-yyyy') || '',
      filter: 'agDateColumnFilter',
      headerTooltip: 'Permit Issue',
    },
    {
      headerName: 'P-Expiry',
      field: 'permitexpiry',
      valueGetter: (params) =>
        params.data.permitexpiry ? new Date(params.data.permitexpiry) : null,
      valueFormatter: (params) =>
        this.datePipe.transform(params.value, 'MM-dd-yyyy') || '',
      filter: 'agDateColumnFilter',
      headerTooltip: 'Permit Expiry',
    },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: 'actionCellRenderer',
      cellRendererParams: {
        onDelete: this.deleteDriver.bind(this),
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

  /**
   * This method for row styles
   * @param params RowStyles
   * @returns row styles
   */
  public getRowStyle = (params: RowClassParams): RowStyle | undefined => {
    const currentDate = new Date();
    const expiryDate = params.data.licenseexpiry
      ? new Date(params.data.licenseexpiry)
      : null;
    if (expiryDate && expiryDate < currentDate) {
      return { background: '#f8d7da', color: '#842029' }; // Inline styles for expired rows.
    }

    const permitExpiryDate = params.data.permitexpiry
      ? new Date(params.data.permitexpiry)
      : null;
    if (permitExpiryDate && permitExpiryDate < currentDate) {
      return { background: '#fff3cd', color: '#856404' }; // Yellow for expired permit
    }
    return undefined; // Default style for other rows.
  };

  /**
   * Grid options
   */
  gridOptions = {
    components: this.components,
    context: {
      onDelete: this.deleteDriver.bind(this),
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
   * This method will destory all the subscriptions
   */
  ngOnDestroy(): void {
    this.subscriptionList.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });
  }
}
