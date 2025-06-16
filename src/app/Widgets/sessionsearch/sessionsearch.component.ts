import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { apiSessionModel } from '../../Models/Assessment';
import { Subscription } from 'rxjs';
import { AssessmentService } from '../../Services/assessment.service';
import { DatePipe } from '@angular/common';
import { UtilitiesService } from '../../Services/utilities.service';
import { ToastComponent } from '../toast/toast.component';
import { ContractorService } from '../../Services/contractor.service';
declare var bootstrap: any;
@Component({
  selector: 'app-sessionsearch',
  imports: [ReactiveFormsModule, ToastComponent, DatePipe],
  templateUrl: './sessionsearch.component.html',
  styleUrl: './sessionsearch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsearchComponent implements OnDestroy {
  /**
   * Search form
   */
  searchForm: FormGroup;
  /**
   * Session signal
   */
  sessions = signal<apiSessionModel[]>([]);
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  /**
   * Input
   */
  @Input() trainingId!: number;
  /**
   * Output
   */
  @Output() closeModal = new EventEmitter<void>();

  /**
   * Selected Sessions
   */
  selectedSessions: any[] = [];
  /**
   * Select All
   */
  selectAll: boolean = false;

  private cService = inject(ContractorService);
  contractors = this.cService.contractors;

  /**
   * Constructor
   * @param fb form builder
   * @param assessmentService assessment service
   * @param utils Utility service
   */
  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private utils: UtilitiesService
  ) {
    this.searchForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  /**
   * This method for search session by name
   */
  searchSessions(): void {
    const searchCriteria = this.searchForm.value.name;
    if (searchCriteria) {
      this.subscriptionList.push(
        this.assessmentService
          .getSessionbydate(null, searchCriteria)
          .subscribe((data: any) => {
            this.sessions.set(data);
          })
      );
    } else {
      this.utils.showToast(`Please insert session name first`, 'warning');
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
   * This method will toggle selection
   * @param session session
   */
  toggleSelection(session: any) {
    const index = this.selectedSessions.findIndex((s) => s.id === session.id);
    if (index !== -1) {
      this.selectedSessions.splice(index, 1); // Remove session if already selected
    } else {
      this.selectedSessions.push(session); // Add session if not already selected
    }
    this.updateSelectAllState();
  }

  /**
   * This mehtod will update selected sessions
   * @param session session
   * @returns selected sessions
   */
  isSelected(session: any): boolean {
    return this.selectedSessions.some((s) => s.id === session.id);
  }

  /**
   * This method will toggle select all options
   */
  toggleSelectAll() {
    if (this.selectAll) {
      this.selectedSessions = [...this.sessions()]; // Select all
    } else {
      this.selectedSessions = []; // Deselect all
    }
  }

  /**
   * This method will update select all state
   */
  updateSelectAllState() {
    this.selectAll = this.selectedSessions.length === this.sessions().length;
  }

  /**
   * This method will attached sessions with training
   */
  saveSelections() {
    if (this.selectedSessions.length === 0) {
      this.utils.showToast('Please select at least one session', 'error');
    } else {
      const payload = {
        trainingId: this.trainingId,
        sessionIds: this.selectedSessions.map((session) => session.id), // Only sending IDs
      };

      this.subscriptionList.push(
        this.assessmentService.createSessoinTraining(payload).subscribe({
          next: (res: any) => {
            //console.log(res.message);
            this.utils.showToast(
              'Sessions have been added with training successfully',
              'success'
            );
            this.close();
          },
          error: (err: any) => {
            const errorMessage = err?.message || 'An unexpected error occurred';
            this.utils.showToast(errorMessage, 'error');
          },
        })
      );
    }
  }

  /**
   * This method for open modal
   */
  openModal(): void {
    const modalElement = document.getElementById('sessionSearchModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      this.searchForm.reset();
      modalInstance.show();
    } else {
      console.error('Modal element not found');
    }
  }

  /**
   * This method will close the modal window
   */
  close() {
    const modalElement = document.getElementById('sessionSearchModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance.hide();
    }
    this.closeModal.emit();
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
