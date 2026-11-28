import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { parseError } from '../../../core/errors/api-error';
import { InstallmentListItem, InstallmentStatus } from '../../model/purchase';
import { PurchasesService } from '../../services/purchases.service';
import { Badge } from '../../../shared/components/badge/badge';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { countEach, FilterChips, FilterOption } from '../../../shared/components/filter-chips/filter-chips';
import { Icon } from '../../../shared/components/icon/icon';
import { Pager } from '../../../shared/components/pager/pager';
import { Page } from '../../../shared/models/page';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { todayLima } from '../../../shared/utils/lima-date';

type StatusFilter = InstallmentStatus | '';
const STATUSES: FilterOption<StatusFilter>[] = [
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'OVERDUE', label: 'Vencidas', tone: 'bad' },
  { value: 'PAID', label: 'Pagadas', tone: 'ok' },
  { value: 'CANCELLED', label: 'Canceladas' },
  { value: '', label: 'Todas' },
];

@Component({
  selector: 'app-installments',
  templateUrl: './installment-list.page.html',
  styleUrl: './installment-list.page.scss',
  imports: [FormsModule, RouterLink, Pager, Badge, EmptyState, ErrorAlert, FilterChips, Icon, SolesPipe, FechaPipe],
})
export class InstallmentListPage implements OnInit {
  private readonly purchasesApi = inject(PurchasesService);
  private route = inject(ActivatedRoute);
  today = todayLima();
  status = signal<StatusFilter>('PENDING');
  dueBefore = signal('');
  data = signal<Page<InstallmentListItem> | null>(null);
  counts = signal<Partial<Record<StatusFilter, number>>>({});
  loading = signal(false);
  error = signal<string | null>(null);

  /** The status chips, each with how many installments it leaves for the chosen date. */
  options = computed(() => STATUSES.map((s) => ({ ...s, count: this.counts()[s.value] ?? null })));

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    if (q.has('status')) this.status.set((q.get('status') ?? '') as StatusFilter);
    if (q.has('due_before')) this.dueBefore.set(q.get('due_before') ?? '');
    this.refresh();
  }

  setStatus(status: StatusFilter): void {
    this.status.set(status);
    this.load(1);
  }

  setDueBefore(date: string): void {
    this.dueBefore.set(date);
    this.refresh();
  }

  /** Reloads the list and the count of every chip. */
  refresh(): void {
    this.load(1);
    const due_before = this.dueBefore();
    countEach(STATUSES, (status) =>
      this.purchasesApi.listInstallments({ page: 1, size: 1, status, due_before }).pipe(map((p) => p.total)),
    ).subscribe({ next: (counts) => this.counts.set(counts), error: () => this.counts.set({}) });
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.purchasesApi.listInstallments({ page, size: 20, status: this.status(), due_before: this.dueBefore() }).subscribe({
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
