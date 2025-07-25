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
} from '@angular/core';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { Subscription } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UtilitiesService } from '../../Services/utilities.service';
import { ClientService } from '../../Services/client.service';
import { ContractorService } from '../../Services/contractor.service';
import { TitleService } from '../../Services/title.service';
import { LocationService } from '../../Services/location.service';
import { TrainerService } from '../../Services/trainer.service';
import { TrainingService } from '../../Services/training.service';
import { CourseService } from '../../Services/course.service';
import { CategoryService } from '../../Services/category.service';
import { AuthService } from '../../Services/auth.service';
import { ROLES } from '../../Models/Constants';

@Component({
  selector: 'app-addtraining',
  imports: [ToastComponent, ReactiveFormsModule],
  templateUrl: './addtraining.component.html',
  styleUrl: './addtraining.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddtrainingComponent implements OnInit, OnDestroy {
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
  private utils = inject(UtilitiesService);
  private authService = inject(AuthService);

  categories = this.categoryService.categories;
  courses = this.courseService.courses;
  statuses = signal<string[]>([]);
  sources = signal<string[]>([]);
  contractors = this.cService.contractors;
  clients = this.clientService.clients;
  trainers = this.trainerService.trainers;
  titles = this.titleService.titles;
  locations = this.locationService.locations;
  previousTax = signal<number>(0);
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

  formTraining: FormGroup;

  /**
   * Constructor
   * @param fb Form builder
   * @param cdRef change detection
   */
  constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef) {
    this.formTraining = this.fb.group({
      name: ['', Validators.required],
      plandate: [null, Validators.required],
      startdate: [],
      enddate: [],
      duration: [],
      courseid: [null, Validators.required],
      categoryid: [null],
      clientid: [],
      contractorid: [],
      titleid: [],
      trainingexpiry: [],
      venue: [],
      trainerid: [null, Validators.required],
      locationid: [],
      requestedby: [],
      source: ['Internal'],
      contactnumber: [],
      invoicenumber: [],
      invoicedate: [],
      charges: [],
      transportation: [],
      miscexpense: [],
      tax: [],
      total: [{ value: 0, disabled: true }],
      bank: [],
      cheque: [],
      amountreceived: [],
      amountreceiveddate: [],
      status: ['Tentative'],
      classroom: [],
      assessment: [],
      commentry: [],
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
    this.utils.setTitle('Add Training');
    this.statuses.set(this.utils.statuses());
    this.sources.set(this.utils.sources());
    setTimeout(() => this.generateKey(), 200);
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
   * This method will set generated key
   */
  async generateKey() {
    try {
      const generatedKey = await this.trainingService.generateKey();
      this.formTraining.get('name')?.setValue(generatedKey);
    } catch (error) {
      console.error('Error generating key:', error);
    }
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
   * This method will create the new training
   */
  createTraining() {
    const formValues = this.formTraining.getRawValue();
    if (!formValues.plandate) {
      this.utils.showToast(
        'Training could not be submitted without Plan Date, Please select it.',
        'error'
      );
    } else {
      let classroom = 1;
      if (formValues.classroom) {
        classroom = 2;
      }
      let assessment = 1;
      if (formValues.assessment) {
        assessment = 2;
      }
      let commentry = 1;
      if (formValues.commentry) {
        commentry = 2;
      }

      this.subscriptionList.push(
        this.trainingService
          .createTraining(
            formValues.name,
            formValues.courseid,
            formValues.categoryid,
            formValues.plandate,
            formValues.startdate,
            formValues.enddate,
            formValues.duration,
            formValues.titleid,
            formValues.clientid,
            formValues.contractorid,
            formValues.trainerid,
            formValues.trainingexpiry,
            formValues.invoicenumber,
            formValues.invoicedate,
            formValues.charges,
            formValues.transportation,
            formValues.miscexpense,
            formValues.tax,
            formValues.total,
            formValues.bank,
            formValues.cheque,
            formValues.amountreceived,
            formValues.amountreceiveddate,
            formValues.requestedby,
            formValues.contactnumber,
            formValues.source,
            formValues.venue,
            formValues.locationid,
            formValues.status,
            classroom,
            assessment,
            commentry
          )
          .subscribe({
            next: (data) => {
              this.utils.showToast(data.message.toString(), 'success');
              this.cdRef.detectChanges();
              this.formRest();
            },
            error: (err) => {
              this.utils.showToast(err.message, 'error');
            },
          })
      );
    }
  }

  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formTraining.reset();
    this.generateKey();
    this.formTraining.patchValue({
      source: 'Internal',
      status: 'Tentative',
    });
    this.formTraining.get('status')?.updateValueAndValidity();
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
