import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-taction-cell-renderer',
  imports: [RouterLink],
  templateUrl: './taction-cell-renderer.component.html',
  styleUrl: './taction-cell-renderer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TActionCellRendererComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  onDeleteTraining() {
    if (this.params.context.onDelete) {
      this.params.context.onDelete(this.params.data.id);
    }
  }
}
