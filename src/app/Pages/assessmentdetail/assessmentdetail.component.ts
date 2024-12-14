import { CommonModule } from '@angular/common';
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
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { apiAssessmentModel, apiSessionModel } from '../../Models/Assessment';
import { apiContractorModel } from '../../Models/Contractor';
import { apiTrainerModel } from '../../Models/Trainer';
import { apiGenericModel } from '../../Models/Generic';
import { apiCategoryModel } from '../../Models/Category';
import { UtilitiesService } from '../../Services/utilities.service';
import { ContractorService } from '../../Services/contractor.service';
import { AssessmentService } from '../../Services/assessment.service';
import { TrainerService } from '../../Services/trainer.service';
import { LocationService } from '../../Services/location.service';
import { ResultService } from '../../Services/result.service';
import { TitleService } from '../../Services/title.service';
import { StageService } from '../../Services/stage.service';
import { VehicleService } from '../../Services/vehicle.service';
import { DriverService } from '../../Services/driver.service';
import { apiClientModel } from '../../Models/Client';
import { ClientService } from '../../Services/client.service';
import { DltypeService } from '../../Services/dltype.service';
import { BloodgroupService } from '../../Services/bloodgroup.service';
import { VisualService } from '../../Services/visual.service';

@Component({
  selector: 'app-assessmentdetail',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ToastComponent,
    RouterLink,
  ],
  templateUrl: './assessmentdetail.component.html',
  styleUrl: './assessmentdetail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentdetailComponent implements OnInit, OnDestroy {
  sessionID: number = 0;
  sessionDetail = signal<apiSessionModel | null>(null);
  assessmentForm: FormGroup;
  formDriver: FormGroup;

  private driverService = inject(DriverService);
  private clientService = inject(ClientService);
  private utils = inject(UtilitiesService);
  private cService = inject(ContractorService);
  private assessmentService = inject(AssessmentService);
  private trainerService = inject(TrainerService);
  private locationService = inject(LocationService);
  private resultService = inject(ResultService);
  private titleService = inject(TitleService);
  private stageService = inject(StageService);
  private vehicleService = inject(VehicleService);
  private dltypeService = inject(DltypeService);
  private bgService = inject(BloodgroupService);
  private visualService = inject(VisualService);

  contractors = this.cService.contractors;
  clients = this.clientService.clients;
  trainers = this.trainerService.trainers;
  selectedTrainerIds = new FormControl({ value: [''], disabled: true });
  titles = this.titleService.titles;
  locations = this.locationService.locations;
  stages = this.stageService.stages;
  results = this.resultService.results;
  vehicles = this.vehicleService.vehicles;
  dltypes = this.dltypeService.dltypes;
  bloodgroups = this.bgService.bloodGroups;
  visuals = this.visualService.visuals;

  isLoading = true;
  isAPICallInProgress = signal<boolean>(false);
  initialFormData: any;
  initialSessionData: any;
  categories = signal<apiCategoryModel[]>([]);
  isEdit = false;

  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * Constructor
   * @param fb form builder
   * @param cdRef Change detector Reference
   * @param route route reference

   */
  constructor(
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.sessionID = parseInt(this.route.snapshot.paramMap.get('id') ?? '0');
    this.utils.setTitle('Assessment Details');
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
      licensetypeid: [{ value: '', disabled: true }, Validators.required],
      licenseexpiry: [{ value: '', disabled: true }, Validators.required],
      bloodgroupid: [{ value: '', disabled: true }, Validators.required],
      contractorid: [{ value: '', disabled: true }, Validators.required],
      clientName: [{ value: '', disabled: true }, Validators.required],
      visualid: [{ value: '', disabled: true }, Validators.required],
    });
  }

  /**
   * This method will invoke all the methods while rendering the page
   */
  ngOnInit(): void {
    this.getAllAssessments();
  }

  /**
   * This method for fetch session from database against sessionid
   */
  getSessionByID() {
    this.subscriptionList.push(
      this.assessmentService
        .getSessionbyID(this.sessionID)
        .subscribe((res: any) => {
          this.sessionDetail.set(res[0]);
          this.initialSessionData = this.sessionDetail();
          this.getDriver(res[0].driverid);
          const data = this.updatedCategories();
          this.categories.set(data);

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
            quizscore: res[0].quizscore,
            comment: res[0].comment,
            traffic: res[0].traffic,
            weather: res[0].weather,
            categories: this.categories(),
          });

          this.cdRef.detectChanges();
        })
    );
  }

  /**
   * This method will get driver against driver id
   */
  getDriver(id: number) {
    this.subscriptionList.push(
      this.driverService.getDriverByID(id).subscribe((driverData: any) => {
        // this.driver = driverData[0];
        this.formDriver.patchValue(driverData[0]);
        const clientid = this.getClientID(driverData[0].contractorid) || 0;
        const clietname = this.getClientName(clientid);
        this.formDriver.patchValue({
          clientName: clietname,
        });
      })
    );
  }

  /**
   * This method for fetch all the assessment data
   */
  getAllAssessments(): void {
    this.subscriptionList.push(
      this.assessmentService.getAllAssessments().subscribe((res: any) => {
        this.getSessionByID();
        this.categories.set(res);
        this.createForm();
        //this.initialFormData = this.assessmentForm.value;
      })
    );
  }

  /**
   * This method for selected trainer
   * @param trainerIds string array trainer Ids
   */
  Selected(trainerIds: string[]) {
    this.selectedTrainerIds.setValue(trainerIds);
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
   * This method will set blood group name against blood group ID
   * @param itemId blood group ID
   * @returns string blood group name
   */
  getClientName(itemId: number): string {
    return this.utils.getGenericName(this.clients(), itemId);
  }

  /**
   * This method for create assessment for with initial values
   */
  createForm(): void {
    this.assessmentForm = this.fb.group({
      sessionName: [{ value: '', disabled: true }, Validators.required],
      sessionDate: [
        { value: null, disabled: !this.isEdit },
        Validators.required,
      ],
      classdate: [{ value: null, disabled: !this.isEdit }],
      yarddate: [{ value: null, disabled: !this.isEdit }],
      trainerid: [{ value: 0, disabled: true }, Validators.required],
      stageId: [{ value: '', disabled: !this.isEdit }],
      titleId: [{ value: '', disabled: !this.isEdit }],
      resultId: [{ value: '', disabled: !this.isEdit }],
      locationId: [{ value: '', disabled: !this.isEdit }],
      vehicleId: [{ value: '', disabled: !this.isEdit }],
      route: [{ value: '', disabled: !this.isEdit }],
      quizscore: [{ value: '', disabled: !this.isEdit }],
      comment: [{ value: '', disabled: !this.isEdit }],
      traffic: [{ value: '', disabled: !this.isEdit }],
      weather: [{ value: '', disabled: !this.isEdit }],
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
                  scoreInitial: [
                    {
                      value: assessment.scoreInitial || null,
                      disabled: !this.isEdit,
                    },
                  ],
                  scoreMiddle: [
                    {
                      value: assessment.scoreMiddle || null,
                      disabled: !this.isEdit,
                    },
                  ],
                  scoreFinal: [
                    {
                      value: assessment.scoreFinal || null,
                      disabled: !this.isEdit,
                    },
                  ],
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

  /**
   * This method for create category form
   * @param category assessment category
   * @returns form
   */
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

  /**
   * This method for get assessments from categories
   * @param category assessment category
   * @returns assessments
   */
  getAssessments(category: AbstractControl) {
    return category.get('assessments') as FormArray;
  }

  /**
   * This method for create assessment form
   * @param assessment
   * @returns assessments
   */
  createAssessmentForm(assessment: any): FormGroup {
    return this.fb.group({
      name: [assessment.name],
      scoreInitial: [assessment.scoreInitial],
      scoreMiddle: [assessment.scoreMiddle],
      scoreFinal: [assessment.scoreFinal],
    });
  }

  /**
   * This method for get controls
   */
  get controls() {
    return (this.assessmentForm.get('categories') as FormArray)?.controls;
  }

  /**
   * This method for get categories array
   */
  get categoriesArray(): FormArray {
    return this.assessmentForm.get('categories') as FormArray;
  }

  /**
   * This method for fetch saved scores
   * @param categoryId number category id
   * @param activityId number activity id
   * @param assessmentType string assessmenttype
   * @returns assessment
   */
  getSavedScores(
    categoryId: number,
    activityId: number,
    assessmentType: string
  ) {
    const scores = this.sessionDetail()?.assessments;
    if (!scores) {
      return null; // Handle the case where scores are not available
    }
    return scores.find(
      (assessment) =>
        assessment.slavecategoryid === categoryId &&
        assessment.activityid === activityId &&
        assessment.assessment_type === assessmentType
    )?.score;
  }

  /**
   * This method for update categories
   * @returns categories
   */
  updatedCategories() {
    return this.categories().map((category) => {
      const updatedAssessments = category.assessments.map((assessment) => {
        return {
          ...assessment,
          scoreInitial:
            this.getSavedScores(category.id, assessment.id, 'Initial') ?? null,
          scoreMiddle:
            this.getSavedScores(category.id, assessment.id, 'Middle') ?? null,
          scoreFinal:
            this.getSavedScores(category.id, assessment.id, 'Final') ?? null,
        };
      });

      return {
        ...category,
        assessments: updatedAssessments,
      };
    });
  }

  /**
   * This method for update assessment form into database
   */
  updateAssessmentForm() {
    const originalSessionData = JSON.parse(
      JSON.stringify(this.sessionDetail())
    );

    if (!this.isAPICallInProgress()) {
      this.isAPICallInProgress.set(true);
      this.subscriptionList.push(
        this.assessmentService
          .updateAssessment(originalSessionData.id, this.assessmentForm.value)
          .subscribe({
            next: (data) => {
              this.utils.showToast(
                'DDC form has been Updated successfully',
                'success'
              );
              this.resetForm();
              this.isAPICallInProgress.set(false);
              this.cdRef.detectChanges();
            },
            error: (err) => {
              this.utils.showToast(err.message, 'error');
              this.isAPICallInProgress.set(false);
              this.cdRef.detectChanges();
            },
          })
      );
    }
  }

  /**
   * This method for reset form
   */
  resetForm() {
    this.getAllAssessments();
  }

  /**
   * This is for print
   */
  printPage(): void {
    window.print();
  }

  /**
   * This method for track
   * @param index number
   * @param _ any
   * @returns track
   */
  trackByIndex(index: number, _: any) {
    return index;
  }

  /**
   * This method will toggel the edit button
   */
  toggleEdit(): void {
    this.isEdit = !this.isEdit;
    // Enable or disable all fields except 'id'
    Object.keys(this.assessmentForm.controls).forEach((field) => {
      if (field !== 'sessionName' && field !== 'trainerid') {
        const control = this.assessmentForm.get(field);

        if (this.isEdit) {
          control?.enable(); // Enable fields when in edit mode
        } else {
          control?.disable(); // Disable fields when not in edit mode
        }
      }
    });
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
