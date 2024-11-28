import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { apiSessionModel } from '../../Models/Assessment';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UtilitiesService } from '../../Services/utilities.service';
import { AssessmentService } from '../../Services/assessment.service';
import { ReportService } from '../../Services/report.service';
import { DatePipe } from '@angular/common';
import { ToastComponent } from '../../Widgets/toast/toast.component';

@Component({
  selector: 'app-assessmentsreport',
  imports: [DatePipe, ToastComponent, ReactiveFormsModule],
  templateUrl: './assessmentsreport.component.html',
  styleUrl: './assessmentsreport.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentsreportComponent implements OnInit, OnDestroy {
  session = signal<apiSessionModel[]>([]);

  formSession: FormGroup;
  /**
   * Subscriptionlist so ngondestory will destory all registered subscriptions.
   */
  subscriptionList: Subscription[] = [];

  constructor(
    private utils: UtilitiesService,
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private reportService: ReportService,
    private cdRef: ChangeDetectorRef
  ) {
    this.formSession = this.fb.group({
      name: 'session',
      sessiondate: [{ value: null }],
      locationid: [{ value: 0 }],
      resultid: [{ value: 0 }],
      classdate: [{ value: null }],
      nic: [{ value: '' }],
      drivername: [{ value: '' }],
      driverid: [{ value: 0 }],
    });
  }

  ngOnInit(): void {
    this.utils.setTitle('Assessment Reports');
  }

  getSessionData() {
    this.subscriptionList.push(
      this.assessmentService
        .getSessionbydate(
          null,
          this.formSession.value.name,
          null,
          null,
          7001,
          null,
          null,
          undefined,
          undefined
        )
        .subscribe((res: any) => {
          this.session.set(res);
        })
    );
  }

  /**
   * This method for generate report against session
   * @param session session array
   */
  async downloadSessionReport(session: apiSessionModel[]) {
    await this.reportService.generatePdfReportSession(session);
  }

  ngOnDestroy(): void {}
}
