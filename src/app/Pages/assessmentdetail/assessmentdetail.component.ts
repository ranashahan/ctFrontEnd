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
import { AssessmentService } from '../../Services/assessment.service';
import { UtilitiesService } from '../../Services/utilities.service';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MasterCategory, SuperCategory } from '../../Models/Assessment';
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
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { CommonModule } from '@angular/common';
import { apiSessionModel, DATA } from '../../Models/Assessment';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DriverService } from '../../Services/driver.service';

@Component({
  selector: 'app-assessmentdetail',
  imports: [
    ReactiveFormsModule,
    ToastComponent,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './assessmentdetail.component.html',
  styleUrl: './assessmentdetail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentdetailComponent implements OnInit, OnDestroy {
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
  private driverService = inject(DriverService);
  /**
   * Variables / Signals
   */
  showInitial = signal<boolean>(false);
  showMiddle = signal<boolean>(false);
  sessionID: number = 0;
  sessionDetail = signal<apiSessionModel | null>(null);
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
  isLicenseExpired = signal<boolean>(false);
  isContractorExist = signal<boolean>(false);
  isDriverLoaded = signal<boolean>(false);
  isAPICallInProgress = signal<boolean>(false);
  licenseVerification = signal<any[]>(this.utils.verificationStatus());
  risks = signal<string[]>(this.utils.risk());
  selectedForm = signal<number>(16001);
  assessmentForm: FormGroup;
  driverForm: FormGroup;
  isEdit = signal<boolean>(false);
  subscriptionList: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.sessionID = parseInt(this.route.snapshot.paramMap.get('id') ?? '0');

    this.assessmentForm = this.fb.group({
      formid: [{ value: 0, disable: true }, Validators.required],
      sessionName: [{ value: '', disabled: true }, Validators.required],
      sessionDate: [
        { value: null, disabled: !this.isEdit() },
        Validators.required,
      ],
      classdate: [{ value: null, disabled: !this.isEdit() }],
      yarddate: [{ value: null, disabled: !this.isEdit() }],
      trainerid: [{ value: 0, disabled: !this.isEdit() }, Validators.required],
      stageId: [{ value: 0, disabled: !this.isEdit() }],
      titleId: [{ value: 0, disabled: !this.isEdit() }],
      resultId: [{ value: 0, disabled: !this.isEdit() }],
      locationId: [{ value: 0, disabled: !this.isEdit() }],
      vehicleId: [{ value: 0, disabled: !this.isEdit() }],
      route: [{ value: '', disabled: !this.isEdit() }],
      riskrating: [{ value: '', disabled: !this.isEdit() }],
      quizscore: [{ value: '', disabled: !this.isEdit() }],
      comment: [{ value: '', disabled: !this.isEdit() }],
      traffic: [{ value: '', disabled: !this.isEdit() }],
      weather: [{ value: '', disabled: !this.isEdit() }],
      categories: this.fb.array([]), // Initialize categories array
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
    this.utils.setTitle('Assessment Detail');
    const scores = this.assessments(); // Assuming this fetches scores
    if (!scores || scores.length === 0) {
    }
    this.getSessionByID();
  }

  /**
   * Private regex method
   */
  private regexPattern = computed(() => {
    return this.selectedForm() === 16001 ? /[^0-3]/g : /[^0-5]/g;
  });
  /**
   * This method will restrict user to type only 1 digit
   * @param event event
   * @param control control
   */
  public restrictToSingleDigit(
    event: any,
    control: AbstractControl | null
  ): void {
    if (!control || !(control instanceof FormControl)) return; // Ensure it's a FormControl
    let input = event.target;
    let value = input.value.replace(this.regexPattern(), ''); // Allow only 0-5

    // Keep only the first digit
    if (value.length > 1) {
      value = value.charAt(0);
    }
    // If value is empty, set it to null
    const finalValue = value === '' ? null : value;

    // Update the input field display
    input.value = finalValue ?? ''; // Show empty string if null

    // Update FormControl value
    control.setValue(finalValue, { emitEvent: false });
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
  private setCategories(categories: MasterCategory[], scores: DATA[]): void {
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
                slavecategory.activities?.map((activity) => {
                  // Find saved scores for this activity
                  const assessments = scores.filter(
                    (a) => a.activityid === activity.id
                  );

                  // Assign scores based on assessment_type
                  const scoreInitial =
                    assessments.find((a) => a.assessment_type === 'Initial')
                      ?.score ?? null;
                  const scoreMiddle =
                    assessments.find((a) => a.assessment_type === 'Middle')
                      ?.score ?? null;
                  const scoreFinal =
                    assessments.find((a) => a.assessment_type === 'Final')
                      ?.score ?? null;

                  return this.fb.group({
                    id: activity.id,
                    name: activity.name,
                    initials: activity.initials,
                    scoreInitial: [
                      { value: scoreInitial, disabled: !this.isEdit() },
                    ], // Set Initial score
                    scoreMiddle: [
                      { value: scoreMiddle, disabled: !this.isEdit() },
                    ], // Set Middle score
                    scoreFinal: [
                      { value: scoreFinal, disabled: !this.isEdit() },
                    ], // Set Final score
                  });
                })
                // slavecategory.activities?.map((activity) =>
                //   this.fb.group({
                //     id: activity.id,
                //     name: activity.name,
                //     initials: activity.initials,
                //     scoreInitial: [activity.scoreInitial],
                //     scoreMiddle: [activity.scoreMiddle],
                //     scoreFinal: [activity.scoreFinal],
                //   })
                // )
              ),
            })
          )
        ),
      })
    );
    const categoryFormArray = this.fb.array(categoryFGs);
    this.assessmentForm.setControl('categories', categoryFormArray);
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
    var vCategories: MasterCategory[] = this.assessmentForm.value.categories;
    var checkAssessment: boolean = this.checkAssessments(vCategories);
    var sessionDate: string = this.assessmentForm.get('sessionDate')?.value;
    if (!sessionDate) {
      this.utils.showToast(
        'Assessment could not be submitted without Session Date, Please select date first!',
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
            .updateAssessment(
              this.sessionDetail()?.id ?? 0,
              this.assessmentForm.value
            )
            .subscribe({
              next: (data) => {
                this.utils.showToast(
                  'DDC form has been updated successfully!',
                  'success'
                );
                this.getSessionByID();
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
    const slaveCategoriesArray = formGroup.get('slavecategories') as FormArray;
    if (!slaveCategoriesArray) return 0;

    let totalScore = 0;

    (slaveCategoriesArray.controls as FormGroup[]).forEach(
      (slaveCategoryFG) => {
        if (slaveCategoryFG.get('id')?.value === slaveCategoryId) {
          const activitiesArray = slaveCategoryFG.get(
            'activities'
          ) as FormArray;

          (activitiesArray.controls as FormGroup[]).forEach((activityFG) => {
            totalScore += Number(activityFG.get('scoreFinal')?.value) || 0;
          });
        }
      }
    );
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

    // return masterCategoryName === 'General'
    //   ? totalActivities * 5
    //   : totalActivities * 3;
    return this.selectedForm() === 16001
      ? totalActivities * 3
      : totalActivities * 5;
  }

  /**
   * This method for fetch session from database against sessionid
   */
  getSessionByID() {
    setTimeout(() => {
      this.subscriptionList.push(
        this.assessmentService
          .getSessionbyID(this.sessionID)
          .subscribe((res: any) => {
            this.assessmentService.selectedSuperCategoryId.set(res[0].formid);
            this.selectedForm.set(res[0].formid);
            this.sessionDetail.set(res[0]);
            this.getDriver(res[0].driverid);
            const formattedSessionDate = this.utils.convertToMySQLDate(
              res[0].sessiondate
            );
            const formattedClassDate = this.utils.convertToMySQLDate(
              res[0].classdate
            );
            const formattedYardDate = this.utils.convertToMySQLDate(
              res[0].yarddate
            );

            this.assessmentForm.patchValue({
              formid: res[0].formid,
              sessionName: res[0].name,
              sessionDate: formattedSessionDate,
              classdate: formattedClassDate,
              yarddate: formattedYardDate,
              trainerid: res[0].trainerid,
              stageId: res[0].stageid,
              titleId: res[0].titleid,
              resultId: res[0].resultid,
              locationId: res[0].locationid,
              vehicleId: res[0].vehicleid,
              route: res[0].route,
              riskrating: res[0].riskrating,
              quizscore: res[0].quizscore,
              comment: res[0].comment,
              traffic: res[0].traffic,
              weather: res[0].weather,
            });
            this.checkAssessmentTypes(this.sessionDetail()?.assessments);

            const categories = this.assessments();
            this.setCategories(
              categories,
              this.sessionDetail()?.assessments || []
            );

            // Step 6: Stop loader once everything is set
            this.isLoading.set(false);

            // this.cdRef.detectChanges();
          })
      );
    }, 200);
  }

  /**
   * This method will get driver against driver id
   */
  getDriver(id: number) {
    this.subscriptionList.push(
      this.driverService.getDriverByID(id).subscribe((driverData: any) => {
        // this.driver = driverData[0];
        this.driverForm.patchValue(driverData[0]);
        const clientid = this.getClientID(driverData[0].contractorid) || 0;
        const clietname = this.getClientName(clientid);
        this.driverForm.patchValue({
          clientname: clietname,
        });
      })
    );
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
   * This method will check which type needs to be enabled on UI
   * @param assessments assessments
   */
  private checkAssessmentTypes(assessments: DATA[] | undefined) {
    if (!assessments) {
    } else {
      const hasInitial = assessments.some(
        (a) => a.assessment_type === 'Initial'
      );
      const hasMiddle = assessments.some((a) => a.assessment_type === 'Middle');

      if (hasInitial) this.showInitial.set(true);
      if (hasMiddle) {
        this.showInitial.set(true);
        this.showMiddle.set(true);
      }
    }
  }

  /**
   * This is for print
   */
  printPage(): void {
    window.print();
  }

  /**
   * This method will toggel the edit button
   */
  toggleEdit(): void {
    this.isEdit.set(!this.isEdit());
    Object.keys(this.assessmentForm.controls).forEach((field) => {
      if (
        field !== 'sessionName' &&
        field !== 'formid' &&
        field !== 'trainerid'
      ) {
        const control = this.assessmentForm.get(field);

        if (this.isEdit()) {
          control?.enable(); // Enable fields when in edit mode
        } else {
          control?.disable(); // Disable fields when not in edit mode
        }
      }
    });
  }

  /**
   * This method will reset the form value to blank
   */
  public formRest(): void {
    this.getSessionByID();
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
