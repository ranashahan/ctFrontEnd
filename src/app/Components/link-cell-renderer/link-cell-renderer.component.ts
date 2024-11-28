import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-link-cell-renderer',
  imports: [RouterLink],
  template: `<a [routerLink]="['/alldrivers/' + params.data.id]">{{
    params.value
  }}</a>`,
})
export class LinkCellRendererComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }
}
