import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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
import { apiContractorModel } from '../../Models/Contractor';
import { apiClientModel } from '../../Models/Client';
import { apiTrainerModel } from '../../Models/Trainer';
import { apiGenericModel } from '../../Models/Generic';
import { LocationService } from '../../Services/location.service';
import { TrainerService } from '../../Services/trainer.service';
import { TrainingService } from '../../Services/training.service';

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

  categories = signal<string[]>([]);
  cources = signal<string[]>([]);
  statuses = signal<string[]>([]);
  sources = signal<string[]>([]);
  contractors = signal<apiContractorModel[]>([]);
  clients = signal<apiClientModel[]>([]);
  trainers = signal<apiTrainerModel[]>([]);
  titles = signal<apiGenericModel[]>([]);
  locations = signal<apiGenericModel[]>([]);
  previousTax = signal<number>(0);

  formTraining: FormGroup;

  constructor(
    private utils: UtilitiesService,
    private fb: FormBuilder,
    private clientService: ClientService,
    private cService: ContractorService,
    private titleService: TitleService,
    private locationService: LocationService,
    private trainerService: TrainerService,
    private trainingService: TrainingService,
    private cdRef: ChangeDetectorRef
  ) {
    this.utils.setTitle('Add Training');

    this.formTraining = this.fb.group({
      name: ['', Validators.required],
      plandate: [],
      startdate: [],
      enddate: [],
      duration: [],
      cource: [null],
      category: [null],
      clientid: [],
      contractorid: [],
      titleid: [],
      trainingexpiry: [],
      venue: [],
      trainerid: [null, Validators.required],
      locationid: [],
      requestedby: [],
      source: [],
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
      status: ['New'],
      classroom: [],
      assessment: [],
      commentry: [],
    });

    this.setupTotalCalculation();
  }

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.categories.set(this.utils.categories());
    this.cources.set(this.utils.cources());
    this.statuses.set(this.utils.statuses());
    this.sources.set(this.utils.sources());
    this.getContractors();
    this.getClients();
    this.getLocations();
    this.getTrainers();
    this.getTitles();
  }

  /**
   * This method will fetch all the contractors
   */
  getContractors() {
    this.subscriptionList.push(
      this.cService.getAll().subscribe((res: any) => {
        this.contractors.set(res);
      })
    );
  }

  /**
   * This method will fetch all the records from database.
   */
  getClients() {
    this.subscriptionList.push(
      this.clientService.getAll().subscribe((res: any) => {
        this.clients.set(res);
      })
    );
  }

  /**
   * This method will fetch all the trainers
   */
  getTrainers() {
    this.subscriptionList.push(
      this.trainerService.getAllTrainers().subscribe((res: any) => {
        this.trainers.set(res);
      })
    );
  }

  /**
   * This method will fetch all the locations
   */
  getLocations() {
    this.subscriptionList.push(
      this.locationService.getAllLocations().subscribe((res: any) => {
        this.locations.set(res);
      })
    );
  }

  /**
   * This method will fetch all the titles
   */
  getTitles() {
    this.subscriptionList.push(
      this.titleService.getAllTitles().subscribe((res: any) => {
        this.titles.set(res);
      })
    );
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

  createTraining() {
    const formValues = this.formTraining.getRawValue();
    console.log(formValues);
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
          formValues.cource,
          formValues.category,
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

  /**
   * This method will reset the form value to blank
   */
  formRest() {
    this.formTraining.reset();
    this.formTraining.patchValue({
      status: 'New',
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
