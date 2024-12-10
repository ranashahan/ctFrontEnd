import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { apiContractorModel } from '../../Models/Contractor';
import { apiGenericModel } from '../../Models/Generic';
import { DriverService } from '../../Services/driver.service';
import { UtilitiesService } from '../../Services/utilities.service';
import { BloodgroupService } from '../../Services/bloodgroup.service';
import { DltypeService } from '../../Services/dltype.service';
import { ContractorService } from '../../Services/contractor.service';
import { VisualService } from '../../Services/visual.service';

@Component({
  selector: 'app-adddriver',
  imports: [ToastComponent, ReactiveFormsModule],
  templateUrl: './adddriver.component.html',
  styleUrl: './adddriver.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdddriverComponent implements OnInit, OnDestroy {
  formDriver: FormGroup;

  contractors = signal<apiContractorModel[]>([]);
  bloodgroups = signal<apiGenericModel[]>([]);
  dltypes = signal<apiGenericModel[]>([]);
  visuals = signal<apiGenericModel[]>([]);
  licenseVerification = signal<any[]>([]);
  gender = signal<string[]>([]);
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];
  /**
   * Constructor
   */
  constructor(
    private dService: DriverService,
    private utils: UtilitiesService,
    private bgService: BloodgroupService,
    private dltypeService: DltypeService,
    private cService: ContractorService,
    private vService: VisualService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    this.utils.setTitle('Add Driver');
    this.formDriver = this.fb.group({
      name: ['', Validators.required],
      gender: [null],
      dob: [null],
      nic: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{5}-\d{7}-\d{1}$/), // NIC pattern validation
        ],
      ],
      nicexpiry: [null],
      licensenumber: ['', Validators.required],
      licensetypeid: [null],
      licenseexpiry: [null],
      licenseverified: [1],
      designation: [''],
      department: [''],
      permitnumber: [''],
      permitissue: [null],
      bloodgroupid: [null],
      contractorid: [null],
      visualid: [null],
      ddccount: [0],
      experience: [0],
      code: [''],
      comment: [''],
    });
  }

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.getBloodGroups();
    this.getDLTypes();
    this.getContractors();
    this.getVisuals();
    this.licenseVerification.set(this.utils.verificationStatus());
    this.gender.set(this.utils.gender());
  }
  /**
   * This methid will get bloodgroups
   */
  getBloodGroups() {
    this.subscriptionList.push(
      this.bgService.getAllBloodgroups().subscribe((res: any) => {
        this.bloodgroups.set(res);
      })
    );
  }
  /**
   * This methid will get visuals
   */
  getVisuals() {
    this.subscriptionList.push(
      this.vService.getAllVisuals().subscribe((res: any) => {
        this.visuals.set(res);
      })
    );
  }
  /**
   * This methid will get DLTypes
   */
  getDLTypes() {
    this.subscriptionList.push(
      this.dltypeService.getAllDLTypes().subscribe((res: any) => {
        this.dltypes.set(res);
      })
    );
  }

  /**
   * This methid will get contractors
   */
  getContractors() {
    this.subscriptionList.push(
      this.cService.getAll().subscribe((res: any) => {
        this.contractors.set(res);
      })
    );
  }

  /**
   * This method will create driver
   */
  createDriver() {
    this.subscriptionList.push(
      this.dService
        .createDriver(
          this.formDriver.value.name,
          this.formDriver.value.gender,
          this.formDriver.value.dob,
          this.formDriver.value.nic,
          this.formDriver.value.nicexpiry,
          this.formDriver.value.licensenumber,
          this.formDriver.value.licensetypeid,
          this.formDriver.value.licenseexpiry,
          this.formDriver.value.licenseverified,
          this.formDriver.value.designation,
          this.formDriver.value.department,
          this.formDriver.value.permitnumber,
          this.formDriver.value.permitissue,
          this.formDriver.value.bloodgroupid,
          this.formDriver.value.contractorid,
          this.formDriver.value.visualid,
          this.formDriver.value.ddccount,
          this.formDriver.value.experience,
          this.formDriver.value.code,
          this.formDriver.value.comment
        )
        .subscribe({
          next: (data) => {
            this.utils.showToast(data.message.toString(), 'success');
            this.cdRef.detectChanges();
            this.resetForm();
          },
          error: (err) => {
            this.utils.showToast(err.message, 'error');
          },
        })
    );
  }

  /**
   * Getter method for driver nic
   */
  get nic() {
    return this.formDriver.get('nic');
  }
  /**
   * Getter method for driver name
   */
  get name() {
    return this.formDriver.get('name');
  }
  /**
   * Getter method for driver license number
   */
  get licensenumber() {
    return this.formDriver.get('licensenumber');
  }
  /**
   * This method will reset the form value to blank
   */
  resetForm(): void {
    this.formDriver.reset();
    this.formDriver.patchValue({
      licenseverified: 1,
    });
    this.formDriver.get('licenseverified')?.updateValueAndValidity();
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
