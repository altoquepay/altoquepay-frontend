import { Component, computed, input } from '@angular/core';
import { LABELS } from '../../utils/labels';

export type BadgeTone = 'ok' | 'info' | 'warn' | 'bad' | 'neutral';

/** Pill de estado con color (Pagado, Próxima, Pendiente, Vencido…). */
@Component({
  selector: 'app-badge',
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  value = input.required<string | null | undefined>();
  /** Texto y tono opcionales para casos como "Próxima" o "En mora". */
  label = input<string | null>(null);
  toneOverride = input<BadgeTone | null>(null, { alias: 'tone' });
  text = computed(() => this.label() ?? (this.value() ? (LABELS[this.value()!] ?? this.value()!) : '—'));
  tone = computed<BadgeTone>(() => {
    const forced = this.toneOverride();
    if (forced) return forced;
    switch (this.value()) {
      case 'ACTIVE':
      case 'PAID':
      case 'PREPAID':
        return 'ok';
      case 'OVERDUE':
      case 'INACTIVE':
      case 'VOIDED':
        return 'bad';
      case 'PENDING':
      case 'CLOSED':
        return 'warn';
      case 'OPEN':
        return 'info';
      default:
        return 'neutral';
    }
  });
}
