import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-action-cell-renderer',
  imports: [CommonModule, RouterLink],
  templateUrl: './action-cell-renderer.component.html',
  styleUrl: './action-cell-renderer.component.css',
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
