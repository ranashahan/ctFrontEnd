import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-slink-cell-renderer',
  imports: [RouterLink],
  template: `<a [routerLink]="['/allassessments/' + params.data.id]">{{
    params.value
  }}</a>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SLinkCellRendererComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }
}
