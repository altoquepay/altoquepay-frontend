import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { Badge } from '../../../shared/components/badge/badge';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Icon } from '../../../shared/components/icon/icon';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { PctPipe } from '../../../shared/pipes/pct.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { daysFromToday, todayLongLima } from '../../../shared/utils/lima-date';
import { Dashboard } from '../../model/reporting';
import { ReportingService } from '../../services/reporting.service';

/** Panel principal: cifras de hoy, próximos vencimientos, accesos rápidos y alertas (GET /dashboard). */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  imports: [RouterLink, EmptyState, ErrorAlert, Icon, Badge, SolesPipe, PctPipe, FechaPipe],
})
export class DashboardPage implements OnInit {
  private readonly reportingApi = inject(ReportingService);
  readonly today = todayLongLima();
  d = signal<Dashboard | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.reportingApi.dashboard().subscribe({
      next: (d) => this.d.set(d),
      error: (e) => this.error.set(parseError(e).message),
    });
  }

  /** Vence hoy o mañana → "Próxima"; si no, "Pendiente". */
  isSoon(date: string): boolean {
    return daysFromToday(date) <= 1;
  }
}
