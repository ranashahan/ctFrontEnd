import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { UtilitiesService } from '../../Services/utilities.service';
import { ClientService } from '../../Services/client.service';
import { ContractorService } from '../../Services/contractor.service';
import { TitleService } from '../../Services/title.service';
import { LocationService } from '../../Services/location.service';
import { TrainerService } from '../../Services/trainer.service';
import { TrainingService } from '../../Services/training.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SessionsearchComponent } from '../../Widgets/sessionsearch/sessionsearch.component';
import { apiVSessionModel } from '../../Models/Assessment';
import { AssessmentService } from '../../Services/assessment.service';
import { DatePipe } from '@angular/common';
import { VehicleService } from '../../Services/vehicle.service';
import { ResultService } from '../../Services/result.service';
import { DeleteConfirmationComponent } from '../../Widgets/delete-confirmation/delete-confirmation.component';
import { CourseService } from '../../Services/course.service';
import { CategoryService } from '../../Services/category.service';
import { DltypeService } from '../../Services/dltype.service';
import { AuthService } from '../../Services/auth.service';
import { ROLES } from '../../Models/Constants';

@Component({
  selector: 'app-trainingdetail',
  imports: [
    ToastComponent,
    ReactiveFormsModule,
    RouterLink,
    SessionsearchComponent,
    DatePipe,
    DeleteConfirmationComponent,
  ],
  templateUrl: './trainingdetail.component.html',
  styleUrl: './trainingdetail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingdetailComponent implements OnInit, OnDestroy {
  @ViewChild(SessionsearchComponent)
  sessionSearchComponent!: SessionsearchComponent;

  @ViewChild(DeleteConfirmationComponent)
  deleteConfirmation!: DeleteConfirmationComponent;

  trainingId = signal<number>(0);
  isEdit = false;
  formTraining: FormGroup;
  initialFormData: any;
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  private trainingService = inject(TrainingService);
  private clientService = inject(ClientService);
  private utils = inject(UtilitiesService);
  private cService = inject(ContractorService);
  private trainerService = inject(TrainerService);
  private dltypeService = inject(DltypeService);
  private locationService = inject(LocationService);
  private resultService = inject(ResultService);
  private titleService = inject(TitleService);
  private vehicleService = inject(VehicleService);
  private assessmentService = inject(AssessmentService);
  private courseService = inject(CourseService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);

  categories = this.categoryService.categories;
  courses = this.courseService.courses;
  statuses = signal<string[]>([]);
  sources = signal<string[]>([]);
  contractors = this.cService.contractors;
  clients = this.clientService.clients;
  trainers = this.trainerService.trainers;
  titles = this.titleService.titles;
  results = this.resultService.results;
  vehicles = this.vehicleService.vehicles;
  locations = this.locationService.locations;
  dltypes = this.dltypeService.dltypes;
  previousTax = signal<number>(0);
  sessions = signal<apiVSessionModel[]>([]);
  verificationStatus = signal<any[]>([]);
  financeEnabled = signal<boolean>(false);

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

  private selectedContractorDetails = computed(() => {
    const contractorId = Number(this.selectedContractor()); // Get the selected contractor ID
    const contractorsList = this.contractors();
    if (!contractorId || !contractorsList || contractorsList.length === 0) {
      return null; // If no contractor is selected or list is empty, return null
    }

    return contractorsList.find((c) => c.id === contractorId) || null;
  });

  /**
   * Constructor
   * @param fb form builder
   * @param route route
   * @param cdRef change detection
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.formTraining = this.fb.group({
      id: [{ value: '', disabled: true }], // Always disabled
      name: [{ value: '', disabled: !this.isEdit }, Validators.required],
      plandate: [{ value: null, disabled: !this.isEdit }, Validators.required],
      startdate: [{ value: null, disabled: !this.isEdit }],
      enddate: [{ value: null, disabled: !this.isEdit }],
      duration: [{ value: null, disabled: !this.isEdit }],
      courseid: [{ value: null, disabled: !this.isEdit }, Validators.required],
      categoryid: [{ value: null, disabled: !this.isEdit }],
      clientid: [{ value: null, disabled: !this.isEdit }],
      contractorid: [{ value: null, disabled: !this.isEdit }],
      titleid: [{ value: null, disabled: !this.isEdit }],
      trainingexpiry: [{ value: null, disabled: !this.isEdit }],
      venue: [{ value: null, disabled: !this.isEdit }],
      trainerid: [{ value: null, disabled: !this.isEdit }, Validators.required],
      locationid: [{ value: null, disabled: !this.isEdit }],
      requestedby: [{ value: null, disabled: !this.isEdit }],
      source: [{ value: null, disabled: !this.isEdit }],
      contactnumber: [{ value: null, disabled: !this.isEdit }],
      invoicenumber: [{ value: null, disabled: !this.isEdit }],
      invoicedate: [{ value: null, disabled: !this.isEdit }],
      charges: [{ value: null, disabled: !this.isEdit }],
      transportation: [{ value: null, disabled: !this.isEdit }],
      miscexpense: [{ value: null, disabled: !this.isEdit }],
      tax: [{ value: null, disabled: !this.isEdit }],
      total: [{ value: null, disabled: !this.isEdit }],
      bank: [{ value: null, disabled: !this.isEdit }],
      cheque: [{ value: null, disabled: !this.isEdit }],
      amountreceived: [{ value: null, disabled: !this.isEdit }],
      amountreceiveddate: [{ value: null, disabled: !this.isEdit }],
      status: [{ value: null, disabled: !this.isEdit }],
      classroom: [{ value: null, disabled: !this.isEdit }],
      assessment: [{ value: null, disabled: !this.isEdit }],
      commentry: [{ value: null, disabled: !this.isEdit }],
      createdby: [{ value: '', disabled: true }],
      created_at: [{ value: null, disabled: true }],
      modifiedby: [{ value: '', disabled: true }],
      modified_at: [{ value: null, disabled: true }],
    });
    this.formTraining.get('clientid')?.valueChanges.subscribe((clientid) => {
      this.selectedClient.set(clientid);
    });

    this.formTraining
      .get('contractorid')
      ?.valueChanges.subscribe((contractorid) => {
        this.selectedContractor.set(contractorid);
      });
    this.setupTotalCalculation();

    effect(() => {
      const contractorDetails = this.selectedContractorDetails(); // Get latest details
      if (contractorDetails) {
        this.formTraining.patchValue({
          requestedby: contractorDetails.contactname || '',
          contactnumber: contractorDetails.contactnumber || '',
        });
      }
    });
  }

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Training Detail');
    this.route.paramMap.subscribe((param) => {
      const trainingid = parseInt(param.get('id') ?? '0');
      this.trainingId.set(trainingid);
      this.getTraining(this.trainingId());
    });
    this.statuses.set(this.utils.statuses());
    this.sources.set(this.utils.sources());
    this.verificationStatus.set(this.utils.verificationStatus());
    const role = this.authService.getUserRole();
    if (
      role === ROLES.ADMIN ||
      role === ROLES.DIRECTOR ||
      role === ROLES.BILLER
    ) {
      this.financeEnabled.set(true);
    }
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
   * This method will set Title name against Title ID
   * @param itemId Title ID
   * @returns string Title name
   */
  getTitleName(itemId: number): string {
    return this.utils.getGenericName(this.titles(), itemId);
  }
  /**
   * This method will set Title name against Title ID
   * @param itemId Title ID
   * @returns string Title name
   */
  getDLTypeName(itemId: number): string {
    return this.utils.getGenericName(this.dltypes(), itemId);
  }
  /**
   * This method will set Vehicle name against Vehicle ID
   * @param itemId Vehicle ID
   * @returns string Vehicle name
   */
  getVehicleName(itemId: number): string {
    return this.utils.getGenericName(this.vehicles(), itemId);
  }
  /**
   * This method will set Result name against Result ID
   * @param itemId Result ID
   * @returns string Result name
   */
  getResultName(itemId: number): string {
    return this.utils.getGenericName(this.results(), itemId);
  }
  /**
   * This method will set Verification name against Verification ID
   * @param itemId Verification ID
   * @returns string Verification name
   */
  getVerificationName(itemId: number): string {
    return this.utils.getGenericName(this.verificationStatus(), itemId);
  }

  /**
   * Getter method for training ID
   */
  get name() {
    return this.formTraining.get('name');
  }

  /**
   * This method will find if any value changes
   */
  setupTotalCalculation() {
    // Combine valueChanges from the dependent fields
    this.formTraining
      .get('charges')
      ?.valueChanges.subscribe(() => this.updateTaxAndTotal());
    this.formTraining
      .get('transportation')
      ?.valueChanges.subscribe(() => this.updateTaxAndTotal());
    this.formTraining
      .get('miscexpense')
      ?.valueChanges.subscribe(() => this.updateTaxAndTotal());
    this.formTraining
      .get('tax')
      ?.valueChanges.subscribe(() => this.calculateTotal());
  }

  /**
   * Calculate the default tax and update the total
   */
  updateTaxAndTotal() {
    const charges = this.formTraining.get('charges')?.value || 0;
    const transportation = this.formTraining.get('transportation')?.value || 0;
    const miscexpense = this.formTraining.get('miscexpense')?.value || 0;

    const taxRate = 0.05; // Default tax rate (5%)
    const calculatedTax = (charges + transportation + miscexpense) * taxRate;

    // Set the default tax value only if the user hasn't overridden it
    const currentTax = this.formTraining.get('tax')?.value || 0;
    if (currentTax === 0 || currentTax === this.previousTax()) {
      this.formTraining
        .get('tax')
        ?.setValue(calculatedTax, { emitEvent: false });
    }

    // Store the previous tax value for comparison
    this.previousTax.set(calculatedTax);

    // Calculate the total
    this.calculateTotal();
  }

  /**
   * This method calculates the total based on all fields
   */
  calculateTotal() {
    const charges = this.formTraining.get('charges')?.value || 0;
    const transportation = this.formTraining.get('transportation')?.value || 0;
    const miscexpense = this.formTraining.get('miscexpense')?.value || 0;
    const tax = this.formTraining.get('tax')?.value || 0;

    const total = charges + transportation + miscexpense + tax;
    this.formTraining.get('total')?.setValue(total, { emitEvent: false });
  }

  /**
   * This method will get training against training id
   */
  getTraining(id: number) {
    this.subscriptionList.push(
      this.trainingService.getTrainingByID(id).subscribe((res: any) => {
        this.formTraining.patchValue(res[0]);

        if (res[0].classroom != 2) {
          this.formTraining.patchValue({
            classroom: false,
          });
        }

        if (res[0].assessment != 2) {
          this.formTraining.patchValue({
            assessment: false,
          });
        }

        if (res[0].commentry != 2) {
          this.formTraining.patchValue({
            commentry: false,
          });
        }

        const formattedPD = this.utils.convertToMySQLDate(res[0].plandate);
        this.formTraining.patchValue({
          plandate: formattedPD,
        });
        this.formTraining.get('plandate')?.updateValueAndValidity();

        const formattedSD = this.utils.convertToMySQLDate(res[0].startdate);
        this.formTraining.patchValue({
          startdate: formattedSD,
        });
        this.formTraining.get('startdate')?.updateValueAndValidity();

        const formattedED = this.utils.convertToMySQLDate(res[0].enddate);
        this.formTraining.patchValue({
          enddate: formattedED,
        });
        this.formTraining.get('enddate')?.updateValueAndValidity();

        const formattedTE = this.utils.convertToMySQLDate(
          res[0].trainingexpiry
        );
        this.formTraining.patchValue({
          trainingexpiry: formattedTE,
        });
        this.formTraining.get('trainingexpiry')?.updateValueAndValidity();

        const formattedID = this.utils.convertToMySQLDate(res[0].invoicedate);
        this.formTraining.patchValue({
          invoicedate: formattedID,
        });
        this.formTraining.get('invoicedate')?.updateValueAndValidity();

        const formattedRD = this.utils.convertToMySQLDate(
          res[0].amountreceiveddate
        );
        this.formTraining.patchValue({
          amountreceiveddate: formattedRD,
        });
        this.formTraining.get('amountreceiveddate')?.updateValueAndValidity();
        this.cdRef.detectChanges();
      })
    );
    this.getSessions();
  }

  /**
   * This method will load the sessions
   */
  getSessions() {
    this.subscriptionList.push(
      this.assessmentService.getSessoinTraining(this.trainingId()).subscribe({
        next: (res: any) => {
          this.sessions.set(res);
        },
        error: (err: any) => {
          this.utils.showToast(err.message, 'error');
        },
      })
    );
  }

  /**
   * This method will deactivate user
   * @param id number
   */
  async deleteSessionTrain(id: number) {
    const isConfirmed = await this.deleteConfirmation.openModal(
      'Relationship ' + this.trainingId() + '-' + id
    );
    if (isConfirmed) {
      this.subscriptionList.push(
        this.assessmentService
          .deleteSessionTraining(this.trainingId(), id)
          .subscribe((res: any) => {
            this.utils.showToast('Session deleted successfully', 'success');
            this.getTraining(this.trainingId());
          })
      );
    }
  }

  /**
   * This method will update training
   */
  updateTraining() {
    const training = this.formTraining.getRawValue();
    var plandate: string = this.formTraining.get('plandate')?.value;

    if (!plandate) {
      this.utils.showToast(
        'Training could not be submitted without Plan Date, Please select it.',
        'error'
      );
    } else {
      let classroom = 1;
      if (training.classroom) {
        classroom = 2;
      }
      let assessment = 1;
      if (training.assessment) {
        assessment = 2;
      }
      let commentry = 1;
      if (training.commentry) {
        commentry = 2;
      }

      this.subscriptionList.push(
        this.trainingService
          .updateTraining(
            training.id,
            training.name,
            training.courseid,
            training.categoryid,
            training.plandate,
            training.startdate,
            training.enddate,
            training.duration,
            training.titleid,
            training.clientid,
            training.contractorid,
            training.trainerid,
            training.trainingexpiry,
            training.invoicenumber,
            training.invoicedate,
            training.charges,
            training.transportation,
            training.miscexpense,
            training.tax,
            training.total,
            training.bank,
            training.cheque,
            training.amountreceived,
            training.amountreceiveddate,
            training.requestedby,
            training.contactnumber,
            training.source,
            training.venue,
            training.locationid,
            training.status,
            classroom,
            assessment,
            commentry
          )
          .subscribe({
            next: (res: any) => {
              this.utils.showToast('Training Saved Successfully!', 'success');
              this.getTraining(this.trainingId());
            },
            error: (err: any) => {
              this.utils.showToast(err.message, 'error');
            },
          })
      );
    }
  }

  /**
   * Close sessoin search modal
   */
  handleModalClose() {
    this.getTraining(this.trainingId());
  }

  /**
   * Open Driver Search Model Popup
   */
  openSearchModal() {
    const buttonElement = document.activeElement as HTMLElement; // Get the currently focused element
    buttonElement.blur();
    this.sessionSearchComponent.openModal();
  }

  /**
   * This method will print the page
   */
  printPage(): void {
    window.print();
  }

  /**
   * This method will toggel the edit button
   */
  toggleEdit(): void {
    this.isEdit = !this.isEdit;
    // Enable or disable all fields except 'id'
    Object.keys(this.formTraining.controls).forEach((field) => {
      if (field !== 'id' && field !== 'createdby') {
        const control = this.formTraining.get(field);
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
    this.formTraining.reset();
    this.getTraining(this.trainingId());
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
