import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastComponent } from '../../Widgets/toast/toast.component';
import { DeleteConfirmationComponent } from '../../Widgets/delete-confirmation/delete-confirmation.component';
import { Subscription } from 'rxjs';
import { apiSessionModel } from '../../Models/Assessment';
import { apiContractorModel } from '../../Models/Contractor';
import { apiGenericModel } from '../../Models/Generic';
import { UtilitiesService } from '../../Services/utilities.service';
import { AssessmentService } from '../../Services/assessment.service';
import { ContractorService } from '../../Services/contractor.service';
import { LocationService } from '../../Services/location.service';
import { StageService } from '../../Services/stage.service';
import { ResultService } from '../../Services/result.service';

@Component({
  selector: 'app-allassessments',
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    RouterLink,
    ToastComponent,
    DeleteConfirmationComponent,
  ],
  templateUrl: './allassessments.component.html',
  styleUrl: './allassessments.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllassessmentsComponent implements OnInit, OnDestroy {
  @ViewChild(DeleteConfirmationComponent)
  deleteConfirmation!: DeleteConfirmationComponent;
  sessions = signal<apiSessionModel[]>([]);
  subscriptionList: Subscription[] = [];
  initialValues: apiSessionModel[] = [];
  contractors = signal<apiContractorModel[]>([]);
  locations = signal<apiGenericModel[]>([]);
  results = signal<apiGenericModel[]>([]);
  stages = signal<apiGenericModel[]>([]);

  paginatedSessions = signal<apiSessionModel[]>([]);
  currentPage: number = 1;
  itemsPerPage: number = 25;
  totalPages: number = 0;
  pages: number[] = [];
  filteredSessions: any[] = [];
  searchTerm: string = '';

  today = new Date();
  oneMonthAgo = new Date(
    this.today.getFullYear(),
    this.today.getMonth() - 1,
    this.today.getDate()
  );
  oneMonthAhead = new Date(
    this.today.getFullYear(),
    this.today.getMonth(),
    this.today.getDate() + 1
  );

  formSession: FormGroup;

  constructor(
    private utils: UtilitiesService,
    private assessmentService: AssessmentService,
    private fb: FormBuilder,
    private cService: ContractorService,
    private lService: LocationService,
    private sService: StageService,
    private rService: ResultService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.utils.setTitle('All Assessments');

    this.formSession = this.fb.group({
      name: [''],
      sessiondate: [null],
      locationid: [null],
      contractorid: [null],
      drivername: [''],
      nic: [''],
      resultid: [null],
      stageid: [null],
      startDate: [this.oneMonthAgo.toISOString().substring(0, 10)],
      endDate: [this.oneMonthAhead.toISOString().substring(0, 10)],
    });
  }

  ngOnInit(): void {
    this.getAllSessionsByDate();
    this.getContractors();
    this.getLocations();
    this.getResults();
    this.getStages();
  }

  getAllSessionsByDate() {
    this.subscriptionList.push(
      this.assessmentService
        .getSessionbydate(
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          this.formSession.value.startDate,
          this.formSession.value.endDate
        )
        .subscribe((res: any) => {
          this.sessions.set(res);
          console.log(this.sessions());
          this.initialValues = res;
          this.filterSessions();
        })
    );
  }

  getContractors() {
    this.subscriptionList.push(
      this.cService.getAllContractors().subscribe((res: any) => {
        this.contractors.set(res);
      })
    );
  }
  getLocations() {
    this.subscriptionList.push(
      this.lService.getAllLocations().subscribe((res: any) => {
        this.locations.set(res);
      })
    );
  }
  getStages() {
    this.subscriptionList.push(
      this.sService.getAllStages().subscribe((res: any) => {
        this.stages.set(res);
      })
    );
  }
  getResults() {
    this.subscriptionList.push(
      this.rService.getAllResults().subscribe((res: any) => {
        this.results.set(res);
      })
    );
  }

  viewAssessmentDetails(id: number): void {
    // Navigate to the driver detail page
    this.router.navigate([`/allassessments/${id}`], { relativeTo: this.route });
  }

  /**
   * This method will delete the session and remove all the relevent records
   * @param id number sessionid
   */
  async deleteAssessment(id: number) {
    const isConfirmed = await this.deleteConfirmation.openModal(
      'assessment: ' + id
    );
    if (isConfirmed)
      this.subscriptionList.push(
        this.assessmentService.deleteSessionByID(id).subscribe((res: any) => {
          this.utils.showToast(
            `Assessment ID: ${id} has been deleted successfully`,
            'success'
          );
          this.getAllSessionsByDate();
          this.cdRef.detectChanges();
        })
      );
  }

  getStageName(itemId: number): string {
    return this.utils.getGenericName(this.stages(), itemId);
  }
  getResultName(itemId: number): string {
    return this.utils.getGenericName(this.results(), itemId);
  }
  getLocationName(itemId: number): string {
    return this.utils.getGenericName(this.locations(), itemId);
  }
  getContractorName(itemId: number): string {
    return this.utils.getGenericName(this.contractors(), itemId);
  }

  getFillterredData() {
    this.subscriptionList.push(
      this.assessmentService
        .getSessionbydate(
          this.formSession.value.nic,
          this.formSession.value.name,
          this.formSession.value.sessiondate,
          this.formSession.value.contractorid,
          this.formSession.value.resultid,
          this.formSession.value.stageid,
          this.formSession.value.locationid,
          this.formSession.value.startDate,
          this.formSession.value.endDate
        )
        .subscribe((res: any) => {
          this.sessions.set(res);
          this.filterSessions();
        })
    );
  }

  filterSessions(): void {
    if (this.sessions() && this.sessions().length > 0) {
      if (this.searchTerm) {
        this.filteredSessions = this.sessions().filter((session) =>
          session.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      } else {
        this.filteredSessions = this.sessions();
      }

      this.currentPage = 1; // Reset to the first page
      this.totalPages = Math.ceil(
        this.filteredSessions.length / this.itemsPerPage
      );
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      this.updatePaginatedSessions();
    } else {
      // Handle case where drivers are null or empty
      this.filteredSessions = [];
      this.totalPages = 0;
      this.pages = [];
      this.updatePaginatedSessions();
    }
  }

  updatePaginatedSessions(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedSessions.set(
      this.filteredSessions.slice(startIndex, startIndex + this.itemsPerPage)
    );
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedSessions();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedSessions();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePaginatedSessions();
  }

  executeExport() {
    this.utils.exportToExcel(
      'allassessment-table',
      'Consult-assessment-export'
    );
  }

  formRest() {
    this.formSession.reset({
      name: '',
      sessiondate: null,
      locationid: null,
      contractorid: null,
      nic: '',
      resultid: null,
      stageid: null,
      startDate: this.oneMonthAgo.toISOString().substring(0, 10),
      endDate: this.oneMonthAhead.toISOString().substring(0, 10),
    });
    this.sessions.set(this.initialValues);
    this.filterSessions();
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
