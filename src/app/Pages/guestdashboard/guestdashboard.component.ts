import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
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
import { UtilitiesService } from '../../Services/utilities.service';
import { AssessmentService } from '../../Services/assessment.service';
import { ContractorService } from '../../Services/contractor.service';
import { LocationService } from '../../Services/location.service';
import { StageService } from '../../Services/stage.service';
import { ResultService } from '../../Services/result.service';
import { ToastComponent } from '../../Widgets/toast/toast.component';

@Component({
  selector: 'app-guestdashboard',
  imports: [ReactiveFormsModule, DatePipe, ToastComponent],
  templateUrl: './guestdashboard.component.html',
  styleUrl: './guestdashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestdashboardComponent implements OnDestroy {
  private utils = inject(UtilitiesService);
  private assessmentService = inject(AssessmentService);
  private cService = inject(ContractorService);
  private locationService = inject(LocationService);
  private stageService = inject(StageService);
  private resultService = inject(ResultService);

  sessions = signal<apiSessionModel[]>([]);
  subscriptionList: Subscription[] = [];
  initialValues: apiSessionModel[] = [];
  contractors = this.cService.contractors;
  locations = this.locationService.locations;
  results = this.resultService.results;
  stages = this.stageService.stages;
  formSession: FormGroup;
  constructor(private fb: FormBuilder) {
    this.utils.setTitle('Dashboard');

    this.formSession = this.fb.group({
      sessiondate: [null],
      locationid: [null],
      drivername: [''],
      nic: ['', Validators.required],
      resultid: [null],
      stageid: [null],
    });
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
          null,
          this.formSession.value.sessiondate,
          null,
          this.formSession.value.resultid,
          this.formSession.value.stageid,
          this.formSession.value.locationid
        )
        .subscribe({
          next: (res: any[]) => {
            if (res.length > 0) {
              this.utils.showToast('Driver Found', 'success');
              this.sessions.set(res);
            } else {
              this.utils.showToast(
                'Could not find any record in database, please correct your search filter',
                'warning'
              );
            }
          },
          error: (err: any) => {
            const errorMessage = err?.message || 'An unexpected error occurred';
            this.utils.showToast(errorMessage, 'error'); // Show error toast
          },
        })
    );
  }

  formRest() {
    this.formSession.reset({
      sessiondate: null,
      locationid: null,
      nic: '',
      resultid: null,
      stageid: null,
    });
    this.sessions.set(this.initialValues);
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
