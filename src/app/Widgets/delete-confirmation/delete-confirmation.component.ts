import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  signal,
} from '@angular/core';
declare var bootstrap: any;
@Component({
  selector: 'app-delete-confirmation',
  imports: [],
  templateUrl: './delete-confirmation.component.html',
  styleUrl: './delete-confirmation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmationComponent {
  message = signal<string>('');
  @Output() confirm = new EventEmitter<boolean>();

  private modalInstance: any;
  private resolvePromise: ((confirmed: boolean) => void) | null = null;

  /**
   * This method will open delete confirmation as popup
   */
  openModal(id: string): Promise<boolean> {
    this.message.set(id);
    const modalElement = document.getElementById('confirmationModal');
    if (modalElement) {
      this.modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
      this.modalInstance.show();
    }

    // Return a new promise that resolves on confirmation or cancellation
    return new Promise<boolean>((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  /**
   * This method for confirm and dismiss the modal
   */
  confirmDelete() {
    this.resolvePromise?.(true); // Resolve the promise as confirmed
    this.modalInstance?.hide();
  }

  /**
   * This method for cancel and dismiss the modal
   */
  cancelDelete() {
    this.resolvePromise?.(false); // Resolve the promise as canceled
    this.modalInstance?.hide();
  }
}
