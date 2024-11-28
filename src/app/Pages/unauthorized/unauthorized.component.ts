import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  imports: [],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {}
