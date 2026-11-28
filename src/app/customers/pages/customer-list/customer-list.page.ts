import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { map } from 'rxjs';
import { lateTeaProblem } from '../../../shared/utils/rates';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { Dashboard } from '../../../reporting/model/reporting';
import { ReportingService } from '../../../reporting/services/reporting.service';
import { Badge } from '../../../shared/components/badge/badge';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { countEach, FilterChips, FilterOption } from '../../../shared/components/filter-chips/filter-chips';
import { Icon } from '../../../shared/components/icon/icon';
import { Pager } from '../../../shared/components/pager/pager';
import { SearchBox } from '../../../shared/components/search-box/search-box';
import { Page } from '../../../shared/models/page';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { initials } from '../../../shared/utils/initials';
import { isValidPhone, PHONE_PATTERN, phoneProblem } from '../../../shared/utils/phone';
import { AccountStatus, CustomerAccount, UpdateAccount } from '../../model/customer';
import { CustomersService } from '../../services/customers.service';

type StatusFilter = AccountStatus | '';
const STATUSES: FilterOption<StatusFilter>[] = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVE', label: 'Activos', tone: 'ok' },
  { value: 'INACTIVE', label: 'Inactivos', tone: 'bad' },
];

/** Gestión de clientes y condiciones de crédito: lista a la izquierda, condiciones del cliente elegido a la derecha. */
@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.page.html',
  styleUrl: './customer-list.page.scss',
  imports: [FormsModule, RouterLink, Pager, Badge, EmptyState, ErrorAlert, FilterChips, Icon, SearchBox, SolesPipe, FechaPipe],
})
export class CustomerListPage implements OnInit {
  private readonly customersApi = inject(CustomersService);
  private readonly reportingApi = inject(ReportingService);
  private readonly toast = inject(ToastService);
  readonly initials = initials;
  readonly phonePattern = PHONE_PATTERN;
  readonly phoneProblem = phoneProblem;

  search = signal('');
  status = signal<StatusFilter>('');
  data = signal<Page<CustomerAccount> | null>(null);
  counts = signal<Partial<Record<StatusFilter, number>>>({});
  /** The status chips, each with how many customers it leaves for the current search. */
  options = computed(() => STATUSES.map((s) => ({ ...s, count: this.counts()[s.value] ?? null })));
  stats = signal<Dashboard | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  selected = signal<CustomerAccount | null>(null);
  form: UpdateAccount | null = null;
  saving = signal(false);
  formError = signal<string | null>(null);

  ngOnInit(): void {
    this.refresh();
    this.reportingApi.dashboard().subscribe({ next: (d) => this.stats.set(d), error: () => {} });
  }

  upcomingTotal(d: Dashboard): number {
    return d.upcoming.reduce((s, u) => s + Number(u.amount), 0);
  }

  setStatus(status: StatusFilter): void {
    this.status.set(status);
    this.load(1);
  }

  setSearch(text: string): void {
    this.search.set(text);
    this.refresh();
  }

  clearFilters(): void {
    this.search.set('');
    this.status.set('');
    this.refresh();
  }

  /** Reloads the list and the count of every chip. */
  refresh(): void {
    this.load(1);
    const search = this.search().trim();
    countEach(STATUSES, (status) =>
      this.customersApi.listCustomers({ page: 1, size: 1, search, status }).pipe(map((p) => p.total)),
    ).subscribe({ next: (counts) => this.counts.set(counts), error: () => this.counts.set({}) });
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.customersApi.listCustomers({ page, size: 8, search: this.search().trim(), status: this.status() }).subscribe({
      next: (d) => {
        this.loading.set(false);
        this.data.set(d);
        const current = this.selected();
        const first = d.items.find((c) => c.id === current?.id) ?? d.items[0] ?? null;
        this.select(first);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }

  select(c: CustomerAccount | null): void {
    this.formError.set(null);
    this.form = c && {
      first_names: c.first_names, last_names: c.last_names, phone: c.phone, address: c.address,
      credit_limit: c.credit_limit, cutoff_day: c.cutoff_day, payment_day: c.payment_day,
      // La API puede mandar una tasa en cero como 0E-7: Number la deja como 0 para que pase el pattern.
      tea: String(Number(c.tea)), late_tea: String(Number(c.late_tea)), max_weeks: c.max_weeks,
    };
    this.selected.set(c);
  }

  cancel(): void {
    this.select(this.selected());
  }

  save(): void {
    const c = this.selected();
    if (!c || !this.form) return;
    if (!isValidPhone(this.form.phone)) {
      this.formError.set(phoneProblem(this.form.phone));
      return;
    }
    if (this.form.payment_day <= this.form.cutoff_day) {
      this.formError.set('El día de pago debe ser posterior al día de corte.');
      return;
    }
    const lateProblem = lateTeaProblem(this.form.tea, this.form.late_tea);
    if (lateProblem) {
      this.formError.set(lateProblem);
      return;
    }
    this.saving.set(true);
    this.formError.set(null);
    const body: UpdateAccount = {
      ...this.form,
      phone: this.form.phone?.trim() || null,
      address: this.form.address?.trim() || null,
      credit_limit: String(this.form.credit_limit),
      tea: String(this.form.tea),
      late_tea: String(this.form.late_tea),
    };
    this.customersApi.updateCustomer(c.id, body).subscribe({
      next: (a) => {
        this.saving.set(false);
        this.data.update((d) => d && { ...d, items: d.items.map((x) => (x.id === a.id ? a : x)) });
        this.select(a);
        this.toast.show('Condiciones guardadas.');
      },
      error: (e) => {
        this.saving.set(false);
        this.formError.set(parseError(e).message);
      },
    });
  }
}
