import { Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

/** Mensaje de error en línea; con `retryable` ofrece volver a intentarlo. */
@Component({
  selector: 'app-error',
  imports: [Icon],
  templateUrl: './error-alert.html',
  styleUrl: './error-alert.scss',
})
export class ErrorAlert {
  message = input<string | null>(null);
  retryable = input(false);
  retry = output<void>();
}
