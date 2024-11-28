import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { apiGenericModel } from '../../Models/Generic';
import { apiContractorModel } from '../../Models/Contractor';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DriverService } from '../../Services/driver.service';
import { BloodgroupService } from '../../Services/bloodgroup.service';
import { ContractorService } from '../../Services/contractor.service';
import { DltypeService } from '../../Services/dltype.service';
import { UtilitiesService } from '../../Services/utilities.service';
import { VisualService } from '../../Services/visual.service';
import { ToastComponent } from '../../Widgets/toast/toast.component';

@Component({
  selector: 'app-driverdetail',
  imports: [RouterLink, ReactiveFormsModule, ToastComponent],
  templateUrl: './driverdetail.component.html',
  styleUrl: './driverdetail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverdetailComponent implements OnInit, OnDestroy {
  driverId: number = 0;
  isEdit = false;
  driverForm: FormGroup;
  bloodgroups = signal<apiGenericModel[]>([]);
  dltypes = signal<apiGenericModel[]>([]);
  visuals = signal<apiGenericModel[]>([]);
  contractors = signal<apiContractorModel[]>([]);
  licenseVerification = signal<any[]>([]);
  initialFormData: any;
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * Constructor
   * @param fb form group
   * @param route route
   * @param driverService driver service for api calls
   * @param bgService bloodgroup service for api calls
   * @param cService contractor service for api calls
   * @param dltypeService dltypes service for api calls
   * @param utils utilities service for set page title
   * @param vService visual service for api calls
   * @param cdRef Change detector Reference
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private driverService: DriverService,
    private bgService: BloodgroupService,
    private cService: ContractorService,
    private dltypeService: DltypeService,
    private utils: UtilitiesService,
    private vService: VisualService,
    private cdRef: ChangeDetectorRef
  ) {
    this.utils.setTitle('Driver details');
    this.driverForm = this.fb.group({
      id: [{ value: '', disabled: true }], // Always disabled
      name: [{ value: '', disabled: !this.isEdit }, Validators.required],
      dob: [{ value: null, disabled: !this.isEdit }],
      age: [{ value: '', disabled: !this.isEdit }],
      nic: [
        { value: '', disabled: true },
        [
          Validators.required,
          Validators.pattern(/^\d{5}-\d{7}-\d{1}$/), // NIC pattern validation
        ],
      ],
      nicexpiry: [{ value: null, disabled: !this.isEdit }],
      licensenumber: [
        { value: '', disabled: !this.isEdit },
        Validators.required,
      ],
      licensetypeid: [{ value: null, disabled: !this.isEdit }],
      licenseexpiry: [{ value: '', disabled: !this.isEdit }],
      licenseverified: [{ value: null, disable: !this.isEdit }],
      designation: [{ value: '', disabled: !this.isEdit }],
      department: [{ value: '', disabled: !this.isEdit }],
      permitnumber: [{ value: '', disabled: !this.isEdit }],
      permitissue: [{ value: '', disabled: !this.isEdit }],
      permitexpiry: [{ value: '', disabled: !this.isEdit }],
      bloodgroupid: [{ value: null, disabled: !this.isEdit }],
      contractorid: [{ value: null, disabled: !this.isEdit }],
      visualid: [{ value: null, disabled: !this.isEdit }],
      ddccount: [{ value: 0, disabled: !this.isEdit }],
      experience: [{ value: 0, disabled: !this.isEdit }],
      code: [{ value: '', disabled: !this.isEdit }],
      comment: [{ value: '', disabled: !this.isEdit }],
      createdby: [{ value: '', disabled: true }],
    });
  }
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    // Get the ID from the route
    this.driverId = parseInt(this.route.snapshot.paramMap.get('id') ?? '0');
    // Fetch the driver details using the ID
    if (this.driverId) {
      this.getDriver();
    }
    this.getBloodGroups();
    this.getDLTypes();
    this.getContractors();
    this.getVisuals();
    this.licenseVerification.set(this.utils.verificationStatus());
  }
  /**
   * This method will get all the blood groups
   */
  getBloodGroups() {
    this.subscriptionList.push(
      this.bgService.getAllBloodgroups().subscribe((res: any) => {
        this.bloodgroups.set(res);
      })
    );
  }
  /**
   * This method will get all the driving license types
   */
  getDLTypes() {
    this.subscriptionList.push(
      this.dltypeService.getAllDLTypes().subscribe((res: any) => {
        this.dltypes.set(res);
      })
    );
  }
  /**
   * This method will get all the visuals
   */
  getVisuals() {
    this.subscriptionList.push(
      this.vService.getAllVisuals().subscribe((res: any) => {
        this.visuals.set(res);
      })
    );
  }

  /**
   * This method will get all the contractors
   */
  getContractors() {
    this.subscriptionList.push(
      this.cService.getAllContractors().subscribe((res: any) => {
        this.contractors.set(res);
      })
    );
  }
  /**
   * This method will set blood group name against blood group ID
   * @param itemId blood group ID
   * @returns string blood group name
   */
  getBloodGroupName(itemId: number): string {
    return this.utils.getGenericName(this.bloodgroups(), itemId);
  }

  /**
   * This method will set Verificatoin name against blood group ID
   * @param itemId Verificatoin ID
   * @returns string Verificatoin name
   */
  getVerificationName(itemId: number): string {
    return this.utils.getGenericName(this.licenseVerification(), itemId);
  }
  /**
   * This method will set contractor name against contractor ID
   * @param itemId contractor ID
   * @returns string contractor name
   */
  getContractorName(itemId: number): string {
    return this.utils.getGenericName(this.contractors(), itemId);
  }
  /**
   * This method will set DLType name against DLType ID
   * @param itemId DLType ID
   * @returns string DLType name
   */
  getDLTypeName(itemId: number): string {
    return this.utils.getGenericName(this.dltypes(), itemId);
  }

  /**
   * This method will set visual name against visual ID
   * @param itemId visual ID
   * @returns string visual name
   */
  getVisualName(itemId: number): string {
    return this.utils.getGenericName(this.visuals(), itemId);
  }

  /**
   * This method will get driver against driver id
   */
  getDriver() {
    this.subscriptionList.push(
      this.driverService
        .getDriverByID(this.driverId)
        .subscribe((driverData: any) => {
          this.driverForm.patchValue(driverData[0]);
          this.cdRef.detectChanges();
        })
    );
  }

  /**
   * This method will print the page
   */
  printPage(): void {
    window.print();
  }

  /**
   * This method will update driver against id
   */
  updateDriver() {
    if (this.driverForm.valid) {
      let updatedDriver = this.driverForm.getRawValue();
      if (updatedDriver.dob) {
        updatedDriver.dob = this.utils.convertToMySQLDate(updatedDriver.dob);
      }
      if (updatedDriver.licenseexpiry) {
        updatedDriver.licenseexpiry = this.utils.convertToMySQLDate(
          updatedDriver.licenseexpiry
        );
      }
      if (updatedDriver.permitissue) {
        updatedDriver.permitissue = this.utils.convertToMySQLDate(
          updatedDriver.permitissue
        );
      }
      if (updatedDriver.nicexpiry) {
        updatedDriver.nicexpiry = this.utils.convertToMySQLDate(
          updatedDriver.nicexpiry
        );
      }

      if (updatedDriver.permitexpiry) {
        updatedDriver.permitexpiry = this.utils.convertToMySQLDate(
          updatedDriver.permitexpiry
        );
      }
      this.subscriptionList.push(
        this.driverService
          .updatedriver(
            updatedDriver.id,
            updatedDriver.name,
            updatedDriver.dob,
            updatedDriver.nic,
            updatedDriver.nicexpiry,
            updatedDriver.licensenumber,
            updatedDriver.licensetypeid,
            updatedDriver.licenseexpiry,
            updatedDriver.licenseverified,
            updatedDriver.designation,
            updatedDriver.department,
            updatedDriver.permitnumber,
            updatedDriver.permitissue,
            updatedDriver.permitexpiry,
            updatedDriver.bloodgroupid,
            updatedDriver.contractorid,
            updatedDriver.visualid,
            updatedDriver.ddccount,
            updatedDriver.experience,
            updatedDriver.code,
            updatedDriver.comment
          )
          .subscribe((res: any) => {
            this.utils.showToast(
              updatedDriver.name + ' Driver update successfully',
              'success'
            );
            this.getDriver();
          })
      );
    }
  }

  /**
   * Getter method for driver nic
   */
  get nic() {
    return this.driverForm.get('nic');
  }
  /**
   * Getter method for driver name
   */
  get name() {
    return this.driverForm.get('name');
  }

  /**
   * Getter method for driver license number
   */
  get licensenumber() {
    return this.driverForm.get('licensenumber');
  }

  /**
   * This method will toggel the edit button
   */
  toggleEdit(): void {
    this.isEdit = !this.isEdit;
    // Enable or disable all fields except 'id'
    Object.keys(this.driverForm.controls).forEach((field) => {
      if (field !== 'id' && field !== 'age' && field !== 'createdby') {
        const control = this.driverForm.get(field);
        if (this.isEdit) {
          control?.enable(); // Enable fields when in edit mode
          // this.cdRef.detectChanges();
        } else {
          control?.disable(); // Disable fields when not in edit mode
          // this.cdRef.detectChanges();
        }
      }
    });
  }

  /**
   * This method will reset the form value to blank
   */
  resetForm(): void {
    this.driverForm.reset();
    this.getDriver();
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
