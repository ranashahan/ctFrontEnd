import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-saction-cell-renderer',
  imports: [RouterLink],
  templateUrl: './saction-cell-renderer.component.html',
  styleUrl: './saction-cell-renderer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SActionCellRendererComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  onDeleteSession() {
    if (this.params.context.onDelete) {
      this.params.context.onDelete(this.params.data.id);
    }
  }
}
