import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { AssessmentService } from '../../Services/assessment.service';
import { UtilitiesService } from '../../Services/utilities.service';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MasterCategory } from '../../Models/Assessment';
import { BloodgroupService } from '../../Services/bloodgroup.service';
import { DltypeService } from '../../Services/dltype.service';
import { ContractorService } from '../../Services/contractor.service';
import { VisualService } from '../../Services/visual.service';
import { TrainerService } from '../../Services/trainer.service';
import { LocationService } from '../../Services/location.service';
import { ResultService } from '../../Services/result.service';
import { TitleService } from '../../Services/title.service';
import { StageService } from '../../Services/stage.service';
import { VehicleService } from '../../Services/vehicle.service';
import { ClientService } from '../../Services/client.service';
import { Subscription } from 'rxjs';
import { apiContractorModel } from '../../Models/Contractor';
import { DriversearchComponent } from '../../Widgets/driversearch/driversearch.component';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-addassessment',
  imports: [
    ReactiveFormsModule,
    ToastComponent,
    DriversearchComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './addassessment.component.html',
  styleUrl: './addassessment.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddassessmentComponent implements OnInit, OnDestroy {
  /**
   * Injection
   */
  private assessmentService = inject(AssessmentService);
  private utils = inject(UtilitiesService);
  private bgService = inject(BloodgroupService);
  private dltypeService = inject(DltypeService);
  private cService = inject(ContractorService);
  private visualService = inject(VisualService);
  private trainerService = inject(TrainerService);
  private locationService = inject(LocationService);
  private resultService = inject(ResultService);
  private titleService = inject(TitleService);
  private stageService = inject(StageService);
  private vehicleService = inject(VehicleService);
  private clientService = inject(ClientService);
  /**
   * Variables / Signals
   */
  showInitial = signal<boolean>(false);
  showMiddle = signal<boolean>(false);
  isLoading = signal<boolean>(true);
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
  assessments = this.assessmentService.assessmentsfilter;
  forms = this.assessmentService.forms;
  isLicenseExpired = signal<boolean>(false);
  isContractorExist = signal<boolean>(false);
  isDriverLoaded = signal<boolean>(false);
  isAPICallInProgress = signal<boolean>(false);
  licenseVerification = signal<any[]>([]);
  assessmentForm: FormGroup;
  driverForm: FormGroup;
  initialFormData: any;
  subscriptionList: Subscription[] = [];

  @ViewChild(DriversearchComponent)
  driverSearchComponent!: DriversearchComponent;

  constructor(private fb: FormBuilder) {
    this.assessmentService.selectedSuperCategoryId.set(16001);
    this.assessmentForm = this.fb.group({
      formid: [16001, Validators.required],
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
      categories: this.fb.array([]), // Initialize categories array
    });
    this.assessmentForm.get('formid')?.valueChanges.subscribe((formid) => {
      this.assessmentService.selectedSuperCategoryId.set(formid);
    });

    effect(() => {
      const categories = this.assessments();
      if (categories && categories.length > 0) {
        this.isLoading.set(false);
        this.setCategories(categories);
      }
    });

    this.driverForm = this.fb.group({
      id: [{ value: '', disabled: true }, Validators.required],
      name: [{ value: '', disabled: true }],
      nic: [{ value: '', disabled: true }],
      nicexpiry: [{ value: '', disabled: true }],
      dob: [{ value: '', disabled: true }],
      age: [{ value: '', disabled: true }],
      permitnumber: [{ value: '', disabled: true }],
      permitexpiry: [{ value: '', disabled: true }],
      licensenumber: [{ value: '', disabled: true }],
      licenseexpiry: [{ value: '', disabled: true }],
      licensetypeid: [{ value: '', disabled: true }],
      licenseverified: [{ value: '', disabled: true }],
      contractorid: [{ value: '', disabled: true }],
      bloodgroupid: [{ value: '', disabled: true }],
      visualid: [{ value: '', disabled: true }],
      clientname: [{ value: '', disabled: true }],
    });
  }

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.utils.setTitle('Add Assessment');
    this.licenseVerification.set(this.utils.verificationStatus());
    // this.setCategories(this.assessments());
  }

  /**
   * This method will restrict user to type only 1 digit
   * @param event event
   */
  public restrictToSingleDigit(event: any): void {
    const input = event.target;
    if (input.value.length > 1) {
      input.value = input.value.slice(0, 1);
    }
  }

  /**
   * this method will toggle initial assessment
   */
  public toggleInitial(): void {
    // this.assessmentForm.markAsUntouched();
    // this.assessmentForm.markAsPristine();
    this.showInitial.set(!this.showInitial());
    if (!this.showInitial()) {
      this.showMiddle.set(false);
    }
  }

  /**
   * this method will toggle middle assessment
   */
  public toggleMiddle(): void {
    this.showMiddle.set(!this.showMiddle());
  }

  /**
   * This method will setup assessment Form
   * @param categories
   */
  private setCategories(categories: MasterCategory[]): void {
    const categoryFGs = categories.map((category) =>
      this.fb.group({
        id: category.id,
        name: category.name,
        slavecategories: this.fb.array(
          category.slavecategories?.map((slavecategory) =>
            this.fb.group({
              id: slavecategory.id,
              name: slavecategory.name,
              initials: slavecategory.initials,
              activities: this.fb.array(
                slavecategory.activities?.map((activity) =>
                  this.fb.group({
                    id: activity.id,
                    name: activity.name,
                    initials: activity.initials,
                    scoreInitial: [activity.scoreInitial],
                    scoreMiddle: [activity.scoreMiddle],
                    scoreFinal: [activity.scoreFinal],
                  })
                )
              ),
            })
          )
        ),
      })
    );
    const categoryFormArray = this.fb.array(categoryFGs);
    this.assessmentForm.setControl('categories', categoryFormArray);
    this.initialFormData = this.assessmentForm.value;
  }

  /**
   * This method will return all the categories
   */
  public get categories() {
    return this.assessmentForm.get('categories') as FormArray;
  }

  /**
   * This method will get slavecategories against category
   * @param categoryIndex category index number
   * @returns slavecategories
   */
  public getSlaveCategories(categoryIndex: number): FormArray {
    return this.categories
      .at(categoryIndex)
      .get('slavecategories') as FormArray;
  }

  /**
   * This method will get activities against category & slavecategory
   * @param categoryIndex category index number
   * @param slaveIndex slavecategory index number
   * @returns activities
   */
  public getActivities(categoryIndex: number, slaveIndex: number): FormArray {
    return this.getSlaveCategories(categoryIndex)
      .at(slaveIndex)
      .get('activities') as FormArray;
  }

  /**
   * This method will save the assessment into database
   */
  public saveAssessment(): void {
    console.log(this.assessmentForm.getRawValue());
    var driverId = this.driverForm.get('id')?.value;
    var contractorID = this.driverForm.get('contractorid')?.value;
    var vCategories: MasterCategory[] = this.assessmentForm.value.categories;
    var checkAssessment: boolean = this.checkAssessments(vCategories);
    var sessionName: string = this.assessmentForm.get('sessionName')?.value;
    var sessionDate: string = this.assessmentForm.get('sessionDate')?.value;
    var trainerID: string = this.assessmentForm.get('trainerid')?.value;
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
    } else if (!sessionName) {
      this.utils.showToast(
        'Assessment could not be submitted without Session Name, Please fill session name first!',
        'error'
      );
    } else if (!sessionDate) {
      this.utils.showToast(
        'Assessment could not be submitted without Session Date, Please select date first!',
        'error'
      );
    } else if (!trainerID) {
      this.utils.showToast(
        'Assessment could not be submitted without Trainer, Please select trainer first!',
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
                this.formRest();
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

  /**
   * This method will verify assessments are not null
   * @param categories MasterCategory
   * @returns boolean
   */
  checkAssessments(categories: MasterCategory[]): boolean {
    return categories.some((category) =>
      category.slavecategories.some((slavecategory) =>
        slavecategory.activities.some(
          (activity) =>
            activity.scoreInitial !== null ||
            activity.scoreMiddle !== null ||
            activity.scoreFinal !== null
        )
      )
    );
  }

  /**
   * This method will calculate final Score as per given activities
   * @param category category
   * @param slaveCategoryId slavecategoryid
   * @returns final number
   */
  public getFinalScoreTotal(
    category: AbstractControl,
    slaveCategoryId: number
  ): number {
    const formGroup = category as FormGroup;
    const slaveCategories = formGroup.get('slavecategories')?.value || [];
    let totalScore = 0;

    // Find the specific slavecategory by its ID
    const slaveCategory = slaveCategories.find(
      (sc: any) => sc.id === slaveCategoryId
    );
    if (slaveCategory) {
      const activities = slaveCategory.activities || [];
      totalScore = activities.reduce(
        (sum: number, activity: any) => sum + (activity.scoreFinal || 0),
        0
      );
    }

    return totalScore;
  }

  /**
   * This method will calculate total Score as per activities length
   * @param category category
   * @param slaveCategoryId slavecategoryid
   * @returns totalscore number
   */
  public getTotalScore(
    category: AbstractControl,
    slaveCategoryId: number
  ): number {
    const formGroup = category as FormGroup;
    const masterCategoryName = formGroup.get('name')?.value || ''; // Get Master Category name
    const slaveCategories = formGroup.get('slavecategories')?.value || [];
    let totalActivities = 0;

    // Find the specific slavecategory by its ID
    const slaveCategory = slaveCategories.find(
      (sc: any) => sc.id === slaveCategoryId
    );
    if (slaveCategory) {
      const activities = slaveCategory.activities || [];
      totalActivities = activities.length;
    }

    return masterCategoryName === 'General'
      ? totalActivities * 5
      : totalActivities * 3;
  }

  /**
   * Open Driver Search Model Popup
   */
  public openSearchModal(): void {
    const buttonElement = document.activeElement as HTMLElement; // Get the currently focused element
    buttonElement.blur(); // Remove focus from the button
    this.driverSearchComponent.openModal(); // Call method to show the modal
  }

  /**
   * This method will update driver form
   * @param driver object
   */
  public onDriverSelected(driver: object): void {
    this.driverForm.patchValue(driver);
    this.isDriverLoaded.set(true);
    const clientid =
      this.getClientID(this.driverForm.get('contractorid')?.value) || 0;
    this.driverForm.get('clientname')?.setValue(this.getClientName(clientid));
    this.checkLicenseExpiry(this.driverForm.get('licenseexpiry')?.value);
    this.validateDriverHasContractor(
      this.driverForm.get('contractorid')?.value
    );
  }

  /**
   * This method will validate Contractor existance
   * @param value {number} contractorid
   */
  private validateDriverHasContractor(value: number): void {
    if (!value) {
      this.isContractorExist.set(true);
    } else {
      this.isContractorExist.set(false);
    }
  }

  /**
   * This method will verify license expiry date passed on current date.
   * @param expiryDate {string} licenseDate
   */
  private checkLicenseExpiry(expiryDate: string): void {
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
   * This method will set blood group name against blood group ID
   * @param itemId blood group ID
   * @returns string blood group name
   */
  private getClientName(itemId: number): string {
    return this.utils.getGenericName(this.clients(), itemId);
  }

  /**
   * This method for fetch contractors
   */
  private getClientID(itemID: number): number {
    const contractor = this.contractors().find(
      (c: apiContractorModel) => c.id === itemID
    );
    return contractor?.clientid || 0;
  }

  /**
   * This method will reset the form value to blank
   */
  public formRest(): void {
    this.driverForm.reset();
    this.isLicenseExpired.set(false);
    this.assessmentForm.reset(this.initialFormData); // Reset form to initial state
    //this.assessmentForm.markAsPristine(); // Optional: mark form as pristine
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
