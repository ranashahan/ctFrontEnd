import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { UtilitiesService } from '../../Services/utilities.service';
import { Toast } from '../../Models/Toast';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(
    private cdRef: ChangeDetectorRef,
    private utils: UtilitiesService
  ) {}

  ngOnInit(): void {
    this.utils.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
      this.cdRef.detectChanges();

      if (this.toasts.length) {
        setTimeout(() => {
          this.startFadeOut();
          this.cdRef.detectChanges();
        }, 4500); // Start fade-out slightly before removal
      }
    });
  }

  startFadeOut() {
    const toastElements = document.querySelectorAll('.toast-container');
    toastElements.forEach((element) => {
      element.classList.add('fade-out');
    });
    setTimeout(() => {
      this.utils.removeToast();
      this.cdRef.detectChanges();
    }, 500); // Remove toast after fade-out completes
  }

  closeToast() {
    this.utils.removeToast();
    this.cdRef.detectChanges();
  }
}
