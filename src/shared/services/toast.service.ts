import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Toast Service
 * 
 * Provides application-wide toast notifications using PrimeNG MessageService:
 * - Success messages (green)
 * - Error messages (red)
 * - Info messages (blue)
 * - Warning messages (yellow)
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService = inject(MessageService);

  public success(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }

  public error(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  public info(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: message,
    });
  }

  public warn(message: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: message,
    });
  }
}
