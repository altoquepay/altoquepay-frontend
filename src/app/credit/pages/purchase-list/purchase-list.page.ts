import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { parseError } from '../../../core/errors/api-error';
import { PaymentMode, Purchase } from '../../model/purchase';
import { PurchasesService } from '../../services/purchases.service';
import { Badge } from '../../../shared/components/badge/badge';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { countEach, FilterChips, FilterOption } from '../../../shared/components/filter-chips/filter-chips';
import { Icon } from '../../../shared/components/icon/icon';
import { Pager } from '../../../shared/components/pager/pager';
import { Page } from '../../../shared/models/page';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { LabelPipe } from '../../../shared/pipes/label.pipe';
import { PctPipe } from '../../../shared/pipes/pct.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';

type ModeFilter = PaymentMode | '';
const MODES: FilterOption<ModeFilter>[] = [
  { value: '', label: 'Todas' },
  { value: 'WEEKLY', label: 'Semanales' },
  { value: 'SINGLE_DATE', label: 'Fecha única' },
];

@Component({
  selector: 'app-purchases-list',
  templateUrl: './purchase-list.page.html',
  styleUrl: './purchase-list.page.scss',
  imports: [FormsModule, RouterLink, Pager, Badge, EmptyState, ErrorAlert, FilterChips, Icon, SolesPipe, PctPipe, LabelPipe, FechaPipe],
})
export class PurchaseListPage implements OnInit {
  private readonly purchasesApi = inject(PurchasesService);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  mode = signal<ModeFilter>('');
  from = signal('');
  to = signal('');
  customerId = signal<number | null>(null);
  data = signal<Page<Purchase> | null>(null);
  counts = signal<Partial<Record<ModeFilter, number>>>({});
  loading = signal(false);
  error = signal<string | null>(null);

  /** The mode chips, each with how many purchases it leaves for the chosen dates and account. */
  options = computed(() => MODES.map((m) => ({ ...m, count: this.counts()[m.value] ?? null })));
  filtered = computed(() => !!(this.mode() || this.from() || this.to() || this.customerId()));

  ngOnInit(): void {
    const cid = this.route.snapshot.queryParamMap.get('customer_id');
    if (cid) this.customerId.set(Number(cid));
    this.refresh();
  }

  setMode(mode: ModeFilter): void {
    this.mode.set(mode);
    this.load(1);
  }

  setRange(from: string, to: string): void {
    this.from.set(from ?? '');
    this.to.set(to ?? '');
    this.refresh();
  }

  setCustomer(id: number | null): void {
    this.customerId.set(id || null);
    this.refresh();
  }

  clearFilters(): void {
    this.mode.set('');
    this.from.set('');
    this.to.set('');
    this.customerId.set(null);
    this.refresh();
  }

  private rangeProblem(): string | null {
    return this.from() && this.to() && this.to() < this.from() ? 'La fecha final debe ser igual o posterior a la inicial.' : null;
  }

  /** Reloads the list and the count of every chip. */
  refresh(): void {
    this.load(1);
    if (this.rangeProblem()) return;
    const q = { page: 1, size: 1, from: this.from(), to: this.to(), customer_id: this.customerId() };
    countEach(MODES, (mode) => this.purchasesApi.listPurchases({ ...q, mode }).pipe(map((p) => p.total))).subscribe({
      next: (counts) => this.counts.set(counts),
      error: () => this.counts.set({}),
    });
  }

  load(page: number): void {
    const problem = this.rangeProblem();
    if (problem) {
      this.error.set(problem);
      this.data.set(null);
      this.counts.set({});
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const q = { page, size: 20, mode: this.mode(), from: this.from(), to: this.to(), customer_id: this.customerId() };
    this.purchasesApi.listPurchases(q).subscribe({
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
