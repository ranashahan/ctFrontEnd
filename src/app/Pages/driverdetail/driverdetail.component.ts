import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DriverService } from '../../Services/driver.service';
import { BloodgroupService } from '../../Services/bloodgroup.service';
import { ContractorService } from '../../Services/contractor.service';
import { DltypeService } from '../../Services/dltype.service';
import { UtilitiesService } from '../../Services/utilities.service';
import { VisualService } from '../../Services/visual.service';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { DatePipe } from '@angular/common';
import { apiSessionModel } from '../../Models/Assessment';
import { LocationService } from '../../Services/location.service';
import { StageService } from '../../Services/stage.service';
import { ResultService } from '../../Services/result.service';
import { TitleService } from '../../Services/title.service';

@Component({
  selector: 'app-driverdetail',
  imports: [RouterLink, ReactiveFormsModule, ToastComponent, DatePipe],
  templateUrl: './driverdetail.component.html',
  styleUrl: './driverdetail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverdetailComponent implements OnInit, OnDestroy {
  driverId = signal<number>(0);
  isEdit = false;
  driverForm: FormGroup;
  private bgService = inject(BloodgroupService);
  private driverService = inject(DriverService);
  private cService = inject(ContractorService);
  private dltypeService = inject(DltypeService);
  private utils = inject(UtilitiesService);
  private vService = inject(VisualService);
  private locationService = inject(LocationService);
  private stageService = inject(StageService);
  private resultService = inject(ResultService);
  private titleService = inject(TitleService);

  bloodgroups = this.bgService.bloodGroups;
  dltypes = this.dltypeService.dltypes;
  visuals = this.vService.visuals;
  contractors = this.cService.contractors;
  locations = this.locationService.locations;
  stages = this.stageService.stages;
  results = this.resultService.results;
  titles = this.titleService.titles;
  licenseVerification = signal<any[]>([]);
  gender = signal<string[]>([]);
  sessions = signal<apiSessionModel[]>([]);
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
    private cdRef: ChangeDetectorRef
  ) {
    this.utils.setTitle('Driver details');
    this.driverForm = this.fb.group({
      id: [{ value: '', disabled: true }], // Always disabled
      name: [{ value: '', disabled: !this.isEdit }, Validators.required],
      gender: [{ value: null, disabled: !this.isEdit }],
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
      permitissue: [{ value: '', disabled: !this.isEdit }, Validators.required],
      permitexpiry: [{ value: '', disabled: !this.isEdit }],
      medicalexpiry: [{ value: '', disabled: !this.isEdit }],
      bloodgroupid: [{ value: null, disabled: !this.isEdit }],
      contractorid: [{ value: null, disabled: !this.isEdit }],
      visualid: [{ value: null, disabled: !this.isEdit }],
      ddccount: [{ value: 0, disabled: !this.isEdit }],
      experience: [{ value: 0, disabled: !this.isEdit }],
      code: [{ value: '', disabled: !this.isEdit }],
      comment: [{ value: '', disabled: !this.isEdit }],
      createdby: [{ value: '', disabled: true }],
      created_at: [{ value: '', disabled: true }],
      modifiedby: [{ value: '', disabled: true }],
      modified_at: [{ value: '', disabled: true }],
    });
  }
  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe((param) => {
      const driverid = parseInt(param.get('id') ?? '0');
      this.driverId.set(driverid);
      this.getDriver(this.driverId());
    });

    this.licenseVerification.set(this.utils.verificationStatus());
    this.gender.set(this.utils.gender());
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
   * This method will set DLType name against DLType ID
   * @param itemId DLType ID
   * @returns string DLType name
   */
  getLocationName(itemId: number): string {
    return this.utils.getGenericName(this.locations(), itemId);
  }
  /**
   * This method will set DLType name against DLType ID
   * @param itemId DLType ID
   * @returns string DLType name
   */
  getStageName(itemId: number): string {
    return this.utils.getGenericName(this.stages(), itemId);
  }
  /**
   * This method will set DLType name against DLType ID
   * @param itemId DLType ID
   * @returns string DLType name
   */
  getTitleName(itemId: number): string {
    return this.utils.getGenericName(this.titles(), itemId);
  }
  /**
   * This method will set DLType name against DLType ID
   * @param itemId DLType ID
   * @returns string DLType name
   */
  getResultName(itemId: number): string {
    return this.utils.getGenericName(this.results(), itemId);
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
  getDriver(id: number) {
    this.subscriptionList.push(
      this.driverService.getDriverByID(id).subscribe((driverData: any) => {
        this.driverForm.patchValue(driverData[0]);

        const formattedDOB = this.utils.convertToMySQLDate(driverData[0].dob);
        this.driverForm.patchValue({
          dob: formattedDOB,
        });
        this.driverForm.get('dob')?.updateValueAndValidity();

        const formattedNIC = this.utils.convertToMySQLDate(
          driverData[0].nicexpiry
        );
        this.driverForm.patchValue({
          nicexpiry: formattedNIC,
        });
        this.driverForm.get('nicexpiry')?.updateValueAndValidity();

        const formattedDLE = this.utils.convertToMySQLDate(
          driverData[0].licenseexpiry
        );
        this.driverForm.patchValue({
          licenseexpiry: formattedDLE,
        });
        this.driverForm.get('licenseexpiry')?.updateValueAndValidity();

        const formattedPI = this.utils.convertToMySQLDate(
          driverData[0].permitissue
        );
        this.driverForm.patchValue({
          permitissue: formattedPI,
        });
        this.driverForm.get('permitissue')?.updateValueAndValidity();

        const formattedPE = this.utils.convertToMySQLDate(
          driverData[0].permitexpiry
        );
        this.driverForm.patchValue({
          permitexpiry: formattedPE,
        });
        this.driverForm.get('permitexpiry')?.updateValueAndValidity();

        const formattedME = this.utils.convertToMySQLDate(
          driverData[0].medicalexpiry
        );
        this.driverForm.patchValue({
          medicalexpiry: formattedME,
        });
        this.driverForm.get('medicalexpiry')?.updateValueAndValidity();
        this.cdRef.detectChanges();
      })
    );

    this.subscriptionList.push(
      this.driverService.getDriverSessionByID(id).subscribe((res: any) => {
        this.sessions.set(res);
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
      this.subscriptionList.push(
        this.driverService
          .updatedriver(
            updatedDriver.id,
            updatedDriver.name,
            updatedDriver.gender,
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
            updatedDriver.medicalexpiry,
            updatedDriver.bloodgroupid,
            updatedDriver.contractorid,
            updatedDriver.visualid,
            updatedDriver.ddccount,
            updatedDriver.experience,
            updatedDriver.code,
            updatedDriver.comment
          )
          .subscribe({
            next: (data) => {
              this.utils.showToast(
                updatedDriver.name + ' Driver update successfully',
                'success'
              );
              this.getDriver(this.driverId());
            },
            error: (err) => {
              this.utils.showToast(err.message, 'error');
              this.toggleEdit();
            },
          })
      );
    } else {
      this.utils.showToast('Fill all the mandatory fields', 'error');
      this.toggleEdit();
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
      if (field !== 'id' && field !== 'age') {
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
    this.getDriver(this.driverId());
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
