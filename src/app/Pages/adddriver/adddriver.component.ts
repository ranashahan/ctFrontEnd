import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
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
import { DriverService } from '../../Services/driver.service';
import { UtilitiesService } from '../../Services/utilities.service';
import { BloodgroupService } from '../../Services/bloodgroup.service';
import { DltypeService } from '../../Services/dltype.service';
import { ContractorService } from '../../Services/contractor.service';
import { VisualService } from '../../Services/visual.service';
import { ClientService } from '../../Services/client.service';

@Component({
  selector: 'app-adddriver',
  imports: [ToastComponent, ReactiveFormsModule],
  templateUrl: './adddriver.component.html',
  styleUrl: './adddriver.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdddriverComponent implements OnInit, OnDestroy {
  formDriver: FormGroup;
  private bgService = inject(BloodgroupService);
  private dService = inject(DriverService);
  private utils = inject(UtilitiesService);
  private dltypeService = inject(DltypeService);
  private cService = inject(ContractorService);
  private vService = inject(VisualService);
  private clientService = inject(ClientService);

  contractors = this.cService.contractors;
  bloodgroups = this.bgService.bloodGroups;
  dltypes = this.dltypeService.dltypes;
  visuals = this.vService.visuals;
  clients = this.clientService.clients;
  licenseVerification = signal<any[]>([]);
  gender = signal<string[]>([]);

  selectedClient = signal<number | null>(null);
  selectedContractor = signal<number | null>(null);

  filteredContractors = computed(() => {
    const clientid = this.selectedClient();
    return clientid
      ? this.contractors().filter(
          (c) => Number(c.clientid) === Number(clientid)
        )
      : this.contractors();
  });

  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];
  /**
   * Constructor
   */
  constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef) {
    this.utils.setTitle('Add Driver');
    this.formDriver = this.fb.group({
      name: ['', Validators.required],
      gender: [null],
      dob: [null],
      mobile: [null],
      nic: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{5}-\d{7}-\d{1}$/), // NIC pattern validation
        ],
      ],
      nicexpiry: [null],
      licensenumber: [null],
      licensetypeid: [null],
      licenseexpiry: [null],
      permitnumber: [null],
      permitissue: [null, Validators.required],
      permitexpiry: [null],
      licenseverified: [1],
      designation: [''],
      department: [''],
      medicalexpiry: [null],
      bloodgroupid: [null],
      clientid: [],
      contractorid: [null],
      visualid: [null],
      ddccount: [0],
      experience: [0],
      code: [''],
      comment: [''],
    });

    this.formDriver.get('permitissue')?.valueChanges.subscribe((issueDate) => {
      if (issueDate) {
        const expiryDate = new Date(issueDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 2); // Add 2 years
        this.formDriver
          .get('permitexpiry')
          ?.setValue(this.formatDate(expiryDate));
      }
    });

    this.formDriver.get('clientid')?.valueChanges.subscribe((clientid) => {
      this.selectedClient.set(clientid);
    });

    this.formDriver
      .get('contractorid')
      ?.valueChanges.subscribe((contractorid) => {
        this.selectedContractor.set(contractorid);
      });
  }

  /**
   * This method for convert date
   * @param date Date
   * @returns date
   */
  private formatDate(date: Date): string {
    return (
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0')
    );
  }

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.licenseVerification.set(this.utils.verificationStatus());
    this.gender.set(this.utils.gender());
    setTimeout(() => this.generateKey(), 200);
  }

  /**
   * This method will set generated key
   */
  async generateKey() {
    try {
      const generatedKey = await this.dService.generateKey();
      this.formDriver.get('permitnumber')?.setValue(generatedKey);
    } catch (error) {
      console.error('Error generating key:', error);
    }
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
          this.formDriver.value.mobile,
          this.formDriver.value.nic,
          this.formDriver.value.nicexpiry,
          this.formDriver.value.licensenumber,
          this.formDriver.value.licensetypeid,
          this.formDriver.value.licenseexpiry,
          this.formDriver.value.permitnumber,
          this.formDriver.value.permitissue,
          this.formDriver.value.permitexpiry,
          this.formDriver.value.licenseverified,
          this.formDriver.value.designation,
          this.formDriver.value.department,
          this.formDriver.value.medicalexpiry,
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
  // get licensenumber() {
  //   return this.formDriver.get('licensenumber');
  // }
  /**
   * This method will reset the form value to blank
   */
  resetForm(): void {
    this.formDriver.reset();
    this.formDriver.patchValue({
      licenseverified: 1,
    });
    this.formDriver.get('licenseverified')?.updateValueAndValidity();
    setTimeout(() => this.generateKey(), 200);
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
