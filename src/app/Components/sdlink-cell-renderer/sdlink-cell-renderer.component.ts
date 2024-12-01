import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-sdlink-cell-renderer',
  imports: [RouterLink],
  template: `<a [routerLink]="['/alldrivers/' + params.data.driverid]">{{
    params.value
  }}</a>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SDLinkCellRendererComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }
}
