import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-action-cell-renderer',
  imports: [RouterLink],
  templateUrl: './action-cell-renderer.component.html',
  styleUrl: './action-cell-renderer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionCellRendererComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  onDeleteUser() {
    if (this.params.context.onDelete) {
      this.params.context.onDelete(this.params.data.id);
    }
  }
}
