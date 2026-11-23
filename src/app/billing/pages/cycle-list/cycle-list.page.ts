import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Cycle, CycleStatus } from '../../model/billing';
import { BillingService } from '../../services/billing.service';
import { parseError } from '../../../core/errors/api-error';
import { Badge } from '../../../shared/components/badge/badge';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Pager } from '../../../shared/components/pager/pager';
import { Page } from '../../../shared/models/page';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { MesPipe } from '../../../shared/pipes/mes.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { MONTHS } from '../../../shared/utils/lima-date';

@Component({
  selector: 'app-cycles',
  templateUrl: './cycle-list.page.html',
  styleUrl: './cycle-list.page.scss',
  imports: [FormsModule, RouterLink, Pager, Badge, ErrorAlert, SolesPipe, FechaPipe, MesPipe],
})
export class CycleListPage implements OnInit {
  private readonly billingApi = inject(BillingService);
  private route = inject(ActivatedRoute);
  months = MONTHS;
  status: CycleStatus | '' = '';
  year: number | null = null;
  month: number | null = null;
  customerId: number | null = null;
  data = signal<Page<Cycle> | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    if (q.get('customer_id')) this.customerId = Number(q.get('customer_id'));
    if (q.get('status')) this.status = q.get('status') as CycleStatus;
    this.load(1);
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.billingApi.listCycles({ page, size: 20, status: this.status, year: this.year, month: this.month, customer_id: this.customerId }).subscribe({
      next: (d) => {
        this.loading.set(false);
        this.data.set(d);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }
}
