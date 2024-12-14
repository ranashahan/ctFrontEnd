import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UtilitiesService } from '../../Services/utilities.service';

@Component({
  selector: 'app-trainingsreport',
  imports: [],
  templateUrl: './trainingsreport.component.html',
  styleUrl: './trainingsreport.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingsreportComponent {
  constructor(private utils: UtilitiesService) {
    this.utils.setTitle('Trainin Reports');
  }
}
