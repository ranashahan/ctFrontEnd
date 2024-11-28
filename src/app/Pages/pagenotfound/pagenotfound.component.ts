import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UtilitiesService } from '../../Services/utilities.service';

@Component({
  selector: 'app-pagenotfound',
  imports: [],
  templateUrl: './pagenotfound.component.html',
  styleUrl: './pagenotfound.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagenotfoundComponent implements OnInit {
  constructor(private utils: UtilitiesService) {}
  ngOnInit(): void {
    this.utils.setTitle('Page Not Found');
  }
}
