import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { AccountOverview, CycleStatement, PortalPurchase, PurchaseSchedule } from '../../model/reporting';
import { ReportingService } from '../../services/reporting.service';
import { Badge } from '../../../shared/components/badge/badge';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { LabelPipe } from '../../../shared/pipes/label.pipe';
import { MesPipe } from '../../../shared/pipes/mes.pipe';
import { PctPipe } from '../../../shared/pipes/pct.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { currentYearMonthLima, MONTHS } from '../../../shared/utils/lima-date';
import { Icon } from '../../../shared/components/icon/icon';

type Tab = 'summary' | 'purchases' | 'statement';

/** Portal: crédito del cliente en una bodega, sus compras, cronogramas y estados de cuenta. */
@Component({
  selector: 'app-portal-store',
  templateUrl: './portal-store.page.html',
  styleUrl: './portal-store.page.scss',
  imports: [FormsModule, RouterLink, Badge, ErrorAlert, SolesPipe, PctPipe, LabelPipe, FechaPipe, MesPipe, Icon],
})
export class PortalStorePage implements OnInit {
  private readonly reportingApi = inject(ReportingService);
  storeId = input.required<string>();
  o = signal<AccountOverview | null>(null);
  tab = signal<Tab>('summary');
  purchases = signal<PortalPurchase[]>([]);
  schedule = signal<PurchaseSchedule | null>(null);
  statement = signal<CycleStatement | null>(null);
  statementMsg = signal('Cargando…');
  error = signal<string | null>(null);
  months = MONTHS;
  year = currentYearMonthLima().year;
  month = currentYearMonthLima().month;
  private purchasesLoaded = false;

  private get sid(): number {
    return Number(this.storeId());
  }

  ngOnInit(): void {
    this.reportingApi.myStoreSummary(this.sid).subscribe({
      next: (o) => this.o.set(o),
      error: (e) => this.error.set(parseError(e).message),
    });
  }

  openPurchases(): void {
    this.tab.set('purchases');
    if (this.purchasesLoaded) return;
    this.purchasesLoaded = true;
    this.reportingApi.myPurchases(this.sid).subscribe({
      next: (p) => this.purchases.set(p),
      error: (e) => this.error.set(parseError(e).message),
    });
  }

  openSchedule(p: PortalPurchase): void {
    this.reportingApi.myPurchaseSchedule(this.sid, p.purchase_id).subscribe({
      next: (s) => this.schedule.set(s),
      error: (e) => this.error.set(parseError(e).message),
    });
  }

  openStatement(): void {
    this.tab.set('statement');
    if (!this.statement()) this.loadStatement();
  }

  loadStatement(): void {
    this.statement.set(null);
    this.statementMsg.set('Cargando…');
    this.reportingApi.myStatement(this.sid, Number(this.year), Number(this.month)).subscribe({
      next: (s) => this.statement.set(s),
      error: (e: unknown) => {
        this.statementMsg.set(
          e instanceof HttpErrorResponse && e.status === 404 ? 'No hay estado de cuenta para ese mes.' : parseError(e).message,
        );
      },
    });
  }
}
