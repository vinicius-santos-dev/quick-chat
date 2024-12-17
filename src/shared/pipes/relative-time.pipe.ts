import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
  standalone: true
})
export class RelativeTimePipe implements PipeTransform {
  /**
 * RelativeTime Pipe
 * 
 * Formats dates into relative time strings based on time difference:
 * - Same day: Shows time (1:30 PM)
 * - Yesterday: Shows "Yesterday"
 * - Within week: Shows day name (Monday)
 * - Older: Shows full date (12/17/2024)
 */
  transform(value: Date | number | string): string {
    if (!value) return '';
    
    const date = new Date(value);
    const now = new Date();

    // Reset hours to compare just dates
    const dateToCompare = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffDays = Math.floor((today.getTime() - dateToCompare.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }
}