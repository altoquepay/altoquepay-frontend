import { Component, computed, input } from '@angular/core';
import { planRows } from '../../../credit/model/payment-plan';
import { GracePeriod, Installment } from '../../../credit/model/purchase';
import { Badge } from '../badge/badge';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { SolesPipe } from '../../pipes/soles.pipe';

/**
 * Cronograma de cuotas semanales (método francés). Las semanas de gracia total van donde se
 * eligieron, por fecha: no se paga y su interés se suma al saldo.
 */
@Component({
  selector: 'app-schedule-table',
  templateUrl: './schedule-table.html',
  styleUrl: './schedule-table.scss',
  imports: [Badge, SolesPipe, FechaPipe],
})
export class ScheduleTable {
  items = input.required<Installment[]>();
  grace = input<GracePeriod[]>([]);
  showStatus = input(true);
  rows = computed(() => planRows(this.items(), this.grace()));
}
