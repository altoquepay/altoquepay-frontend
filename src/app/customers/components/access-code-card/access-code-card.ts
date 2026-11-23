import { Component, input } from '@angular/core';
import { AccessCode } from '../../model/customer';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';

/** Muestra un código de acceso bien visible (solo se ve una vez). */
@Component({
  selector: 'app-access-code',
  templateUrl: './access-code-card.html',
  styleUrl: './access-code-card.scss',
  imports: [FechaPipe],
})
export class AccessCodeCard {
  code = input.required<AccessCode>();
  who = input<string>('el cliente');

  formatted(): string {
    const c = this.code().code;
    return c.length === 12 ? `${c.slice(0, 4)} ${c.slice(4, 8)} ${c.slice(8)}` : c;
  }

  copy(): void {
    navigator.clipboard?.writeText(this.code().code);
  }
}
