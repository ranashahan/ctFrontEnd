import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UtilitiesService } from '../../Services/utilities.service';
import { CommonModule } from '@angular/common';
import { MastercategoryComponent } from '../../Widgets/mastercategory/mastercategory.component';
import { SlavecategoryComponent } from '../../Widgets/slavecategory/slavecategory.component';
import { ActivitiesComponent } from '../../Widgets/activities/activities.component';

@Component({
  selector: 'app-configureassessment',
  imports: [
    CommonModule,
    MastercategoryComponent,
    SlavecategoryComponent,
    ActivitiesComponent,
  ],
  templateUrl: './configureassessment.component.html',
  styleUrl: './configureassessment.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigureassessmentComponent {
  constructor(private utils: UtilitiesService) {
    this.utils.setTitle('Configuration Assessment');
  }
}
