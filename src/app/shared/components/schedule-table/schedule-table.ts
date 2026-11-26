import { Component, input } from '@angular/core';
import { Installment } from '../../../credit/model/purchase';
import { Badge } from '../badge/badge';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { SolesPipe } from '../../pipes/soles.pipe';

/** Cronograma de cuotas semanales (método francés). */
@Component({
  selector: 'app-schedule-table',
  templateUrl: './schedule-table.html',
  styleUrl: './schedule-table.scss',
  imports: [Badge, SolesPipe, FechaPipe],
})
export class ScheduleTable {
  items = input.required<Installment[]>();
  showStatus = input(true);
}
