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
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { apiGenericModel } from '../../Models/Generic';
import { map, Observable, Subscription } from 'rxjs';
import { apiContractorModel } from '../../Models/Contractor';
import { apiTrainerModel } from '../../Models/Trainer';
import { DriversearchComponent } from '../../Widgets/driversearch/driversearch.component';
import { apiCategoryModel } from '../../Models/Category';
import { UtilitiesService } from '../../Services/utilities.service';
import { BloodgroupService } from '../../Services/bloodgroup.service';
import { DltypeService } from '../../Services/dltype.service';
import { ContractorService } from '../../Services/contractor.service';
import { VisualService } from '../../Services/visual.service';
import { AssessmentService } from '../../Services/assessment.service';
import { TrainerService } from '../../Services/trainer.service';
import { LocationService } from '../../Services/location.service';
import { ResultService } from '../../Services/result.service';
import { TitleService } from '../../Services/title.service';
import { StageService } from '../../Services/stage.service';
import { VehicleService } from '../../Services/vehicle.service';
import { apiClientModel } from '../../Models/Client';
import { ClientService } from '../../Services/client.service';
import { apiAssessmentModel } from '../../Models/Assessment';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { ToastComponent } from '../../Widgets/toast/toast.component';

@Component({
  selector: 'app-addassessment',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastComponent,
    DriversearchComponent,
  ],
  templateUrl: './addassessment.component.html',
  styleUrl: './addassessment.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddassessmentComponent implements OnInit, OnDestroy {
  assessmentForm: FormGroup;
  formDriver: FormGroup;
  private bgService = inject(BloodgroupService);
  private dltypeService = inject(DltypeService);
  private cService = inject(ContractorService);
  private visualService = inject(VisualService);
  private assessmentService = inject(AssessmentService);
  private trainerService = inject(TrainerService);
  private locationService = inject(LocationService);
  private resultService = inject(ResultService);
  private titleService = inject(TitleService);
  private stageService = inject(StageService);
  private vehicleService = inject(VehicleService);
  private clientService = inject(ClientService);
  bloodGroups = this.bgService.bloodGroups;
  visuals = this.visualService.visuals;
  dltypes = this.dltypeService.dltypes;

  contractors = this.cService.contractors;
  clients = this.clientService.clients;
  trainers = this.trainerService.trainers;
  titles = this.titleService.titles;
  locations = this.locationService.locations;
  stages = this.stageService.stages;
  results = this.resultService.results;
  vehicles = this.vehicleService.vehicles;
  isLicenseExpired = signal<boolean>(false);
  isContractorExist = signal<boolean>(false);
  isLoading = true;
  isAPICallInProgress = signal<boolean>(false);
  subscriptionList: Subscription[] = [];

  @ViewChild(DriversearchComponent)
  driverSearchComponent!: DriversearchComponent;
  initialFormData: any;
  categories = signal<apiCategoryModel[]>([]);

  constructor(
    private fb: FormBuilder,
    private utils: UtilitiesService,

    private cdRef: ChangeDetectorRef
  ) {
    this.utils.setTitle('Add Assessment');
    this.assessmentForm = this.fb.group({});

    this.formDriver = this.fb.group({
      id: [{ value: '', disabled: true }, Validators.required],
      name: [{ value: '', disabled: true }, Validators.required],
      nic: [{ value: '', disabled: true }, Validators.required],
      nicexpiry: [{ value: '', disabled: true }, Validators.required],
      dob: [{ value: '', disabled: true }, Validators.required],
      age: [{ value: '', disabled: true }, Validators.required],
      permitnumber: [{ value: '', disabled: true }, Validators.required],
      permitexpiry: [{ value: '', disabled: true }, Validators.required],
      licensenumber: [{ value: '', disabled: true }, Validators.required],
      licenseexpiry: [{ value: '', disabled: true }, Validators.required],
      licensetypeid: [{ value: '', disabled: true }, Validators.required],
      contractorid: [{ value: '', disabled: true }, Validators.required],
      bloodgroupid: [{ value: '', disabled: true }, Validators.required],
      visualid: [{ value: '', disabled: true }, Validators.required],
      clientname: [{ value: '', disabled: true }, Validators.required],
    });
  }
  ngOnInit(): void {
    this.getAllAssessments();
  }

  getAllAssessments(): void {
    this.subscriptionList.push(
      this.assessmentService.getAllAssessments().subscribe((res: any) => {
        this.categories.set(res);
        this.createForm();
        this.initialFormData = this.assessmentForm.value;
      })
    );
  }

  /**
   * This method will set blood group name against blood group ID
   * @param itemId blood group ID
   * @returns string blood group name
   */
  getClientName(itemId: number): string {
    return this.utils.getGenericName(this.clients(), itemId);
  }

  /**
   * This method for fetch contractors
   */
  getClientID(itemID: number) {
    const contractor = this.contractors().find(
      (c: apiContractorModel) => c.id === itemID
    );
    return contractor?.clientid;
  }

  /**
   * This method will create form for session
   */
  createForm(): void {
    this.assessmentForm = this.fb.group({
      sessionName: ['', Validators.required],
      sessionDate: [null, Validators.required],
      classdate: [null],
      yarddate: [null],
      trainerid: [null, Validators.required],
      stageId: [],
      titleId: [],
      resultId: [],
      locationId: [],
      vehicleId: [],
      route: [],
      quizscore: [],
      comment: [],
      traffic: [],
      weather: [],
      categories: this.fb.array(
        this.categories().map((category: apiCategoryModel) =>
          this.fb.group({
            id: [category.id],
            selected: [false],
            assessments: this.fb.array(
              // Ensure the 'assessments' FormArray is initialized
              category.assessments.map((assessment: apiAssessmentModel) =>
                this.fb.group({
                  id: [assessment.id || 0],
                  name: [assessment.name || ''],
                  initials: [assessment.initials || ''],
                  scoreInitial: [null],
                  scoreMiddle: [null],
                  scoreFinal: [null],
                })
              )
            ),
          })
        )
      ),
    });
    setTimeout(() => {
      this.isLoading = false; // Hide loader when data is loaded
      this.cdRef.detectChanges();
    }, 1000);
  }

  createCategoryForm(category: any): FormGroup {
    return this.fb.group({
      selected: [category.selected],
      assessments: this.fb.array(
        category.assessments.map((assessment: any) =>
          this.createAssessmentForm(assessment)
        )
      ),
    });
  }

  getAssessments(category: AbstractControl) {
    return category.get('assessments') as FormArray;
  }

  createAssessmentForm(assessment: any): FormGroup {
    return this.fb.group({
      name: [assessment.name],
      scoreInitial: [assessment.scoreInitial],
      scoreMiddle: [assessment.scoreMiddle],
      scoreFinal: [assessment.scoreFinal],
    });
  }

  get controls() {
    return (this.assessmentForm.get('categories') as FormArray)?.controls;
  }

  get categoriesArray(): FormArray {
    return this.assessmentForm.get('categories') as FormArray;
  }

  /**
   * This method will toggle category
   * @param index number
   */
  toggleCategory(index: number): void {
    const categoryControl = this.categoriesArray.at(index) as FormGroup;
    const selected = categoryControl.get('selected')?.value;
    //console.log(`Category at index ${index} selected: ${selected}`);
  }

  /**
   * Open Driver Search Model Popup
   */
  openSearchModal() {
    this.driverSearchComponent.openModal(); // Call method to show the modal
  }

  /**
   * This method will update driver form
   * @param driver object
   */
  onDriverSelected(driver: object) {
    this.formDriver.patchValue(driver);
    const clientid =
      this.getClientID(this.formDriver.get('contractorid')?.value) || 0;
    this.formDriver.get('clientname')?.setValue(this.getClientName(clientid));
    this.checkLicenseExpiry(this.formDriver.get('licenseexpiry')?.value);
    this.validateDriverHasContractor(
      this.formDriver.get('contractorid')?.value
    );
  }

  validateDriverHasContractor(value: number) {
    if (!value) {
      this.isContractorExist.set(true);
    } else {
      this.isContractorExist.set(false);
    }
  }

  checkLicenseExpiry(expiryDate: string) {
    const today = new Date();
    const expiry = new Date(expiryDate);

    if (expiry < today) {
      this.isLicenseExpired.set(true); // Apply red border
      this.utils.showToast(
        'Drivers license has expired. Please update it!',
        'warning'
      );
    } else {
      this.isLicenseExpired.set(false); // Remove red border
    }
  }

  /**
   * This method for insert assessment form into database
   */
  insertAssessment(): void {
    var driverId = this.formDriver.get('id')?.value;
    var contractorID = this.formDriver.get('contractorid')?.value;
    var vCategories: apiCategoryModel[] = this.assessmentForm.value.categories;
    var checkAssessment: boolean = this.checkAssessments(vCategories);
    if (!driverId) {
      this.utils.showToast(
        'Assessment could not be submitted without Driver, Please select driver first!',
        'error'
      );
    } else if (!contractorID) {
      this.utils.showToast(
        'Assessment could not be submitted without Contractor, Please update driver first!',
        'error'
      );
    } else if (!checkAssessment) {
      this.utils.showToast(
        'Assessment data are mandatory, please submit at least one score',
        'error'
      );
    } else {
      if (!this.isAPICallInProgress()) {
        this.isAPICallInProgress.set(true);
        this.subscriptionList.push(
          this.assessmentService
            .createAssessment(driverId, contractorID, this.assessmentForm.value)
            .subscribe({
              next: (data) => {
                this.utils.showToast(
                  'DDC form has been saved successfully!',
                  'success'
                );
                this.resetForm();
                this.isAPICallInProgress.set(false);
              },
              error: (err) => {
                this.utils.showToast(err.message, 'error');
                this.isAPICallInProgress.set(false);
              },
            })
        );
      }
    }
  }

  checkAssessments(categories: apiCategoryModel[]): boolean {
    return categories.some((category) =>
      category.assessments.some(
        (assessment) =>
          assessment.scoreInitial !== null ||
          assessment.scoreMiddle !== null ||
          assessment.scoreFinal !== null
      )
    );
  }

  resetForm(): void {
    this.formDriver.reset();
    this.isLicenseExpired.set(false);
    this.assessmentForm.reset(this.initialFormData); // Reset form to initial state
    this.assessmentForm.markAsPristine(); // Optional: mark form as pristine
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptionList.forEach((item) => {
      item.unsubscribe();
    });
  }
}
