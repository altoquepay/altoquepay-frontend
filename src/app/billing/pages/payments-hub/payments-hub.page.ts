import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { parseError } from '../../../core/errors/api-error';
import { CustomerAccount } from '../../../customers/model/customer';
import { CustomersService } from '../../../customers/services/customers.service';
import { InstallmentStatus } from '../../../credit/model/purchase';
import { PurchasesService } from '../../../credit/services/purchases.service';
import { Dashboard } from '../../../reporting/model/reporting';
import { ReportingService } from '../../../reporting/services/reporting.service';
import { Badge } from '../../../shared/components/badge/badge';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Icon } from '../../../shared/components/icon/icon';
import { Pager } from '../../../shared/components/pager/pager';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { MesPipe } from '../../../shared/pipes/mes.pipe';
import { PctPipe } from '../../../shared/pipes/pct.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { initials } from '../../../shared/utils/initials';
import { daysFromToday, todayLima, todayLongLima } from '../../../shared/utils/lima-date';
import { CycleStatus, PaymentKind, PaymentQuote, PaymentTarget } from '../../model/billing';
import { BillingService } from '../../services/billing.service';

type Tab = 'installments' | 'cycles';

/** Una obligación por cobrar: una cuota semanal o un estado de cuenta cerrado. */
interface Obligation {
  key: string;
  type: 'INSTALLMENT' | 'CYCLE';
  targetId: number;
  customerId: number;
  title: string;
  detail: string;
  amount: string;
  dueDate: string;
  status: string;
  purchaseId: number | null;
}

/** Gestión de pagos y mora: obligaciones por cobrar, cotización de hoy y registro del pago. */
@Component({
  selector: 'app-payments-hub',
  templateUrl: './payments-hub.page.html',
  styleUrl: './payments-hub.page.scss',
  imports: [RouterLink, Badge, EmptyState, ErrorAlert, Icon, Pager, SolesPipe, PctPipe, FechaPipe, MesPipe],
})
export class PaymentsHubPage implements OnInit {
  private readonly purchasesApi = inject(PurchasesService);
  private readonly billingApi = inject(BillingService);
  private readonly customersApi = inject(CustomersService);
  private readonly reportingApi = inject(ReportingService);
  private readonly toast = inject(ToastService);
  readonly initials = initials;
  readonly todayText = todayLongLima();
  private readonly today = todayLima();

  tab = signal<Tab>('installments');
  filter = signal<'' | 'OVERDUE' | 'PENDING'>('');
  rows = signal<Obligation[]>([]);
  page = signal(1);
  total = signal(0);
  readonly size = 10;
  loading = signal(false);
  error = signal<string | null>(null);

  stats = signal<Dashboard | null>(null);
  collectedToday = signal<{ total: number; count: number } | null>(null);
  customers = signal<Record<number, CustomerAccount | undefined>>({});

  selected = signal<Obligation | null>(null);
  quote = signal<PaymentQuote | null>(null);
  quoting = signal(false);
  paying = signal(false);
  quoteError = signal<string | null>(null);

  selectedCustomer = computed(() => {
    const s = this.selected();
    return s ? (this.customers()[s.customerId] ?? null) : null;
  });

  ngOnInit(): void {
    this.loadStats();
    this.load(1);
  }

  loadStats(): void {
    this.reportingApi.dashboard().subscribe({ next: (d) => this.stats.set(d), error: () => {} });
    this.billingApi.listPayments({ from: this.today, to: this.today, size: 100 }).subscribe({
      next: (p) => this.collectedToday.set({ total: p.items.reduce((s, x) => s + Number(x.total), 0), count: p.total }),
      error: () => {},
    });
  }

  setTab(t: Tab): void {
    this.tab.set(t);
    this.load(1);
  }

  setFilter(f: '' | 'OVERDUE' | 'PENDING'): void {
    this.filter.set(f);
    this.load(1);
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.page.set(page);
    if (this.tab() === 'installments') {
      // "Todas" muestra primero las vencidas y luego las pendientes de la página pedida.
      const statuses: InstallmentStatus[] =
        this.filter() === '' ? ['OVERDUE', 'PENDING'] : [this.filter() as InstallmentStatus];
      forkJoin(
        statuses.map((status) => this.purchasesApi.listInstallments({ page, size: this.size, status })),
      ).subscribe({
        next: (pages) => {
          const items = pages.flatMap((p) => p.items);
          this.total.set(Math.max(...pages.map((p) => p.total)));
          this.setRows(items.filter((i) => i.id !== null).map((i) => ({
            key: `i${i.id}`,
            type: 'INSTALLMENT' as const,
            targetId: i.id!,
            customerId: i.customer_id,
            title: `Compra #${i.purchase_id}`,
            detail: `Cuota ${i.number}`,
            amount: i.amount,
            dueDate: i.due_date,
            status: i.status,
            purchaseId: i.purchase_id,
          })));
        },
        error: (e) => this.fail(e),
      });
    } else {
      const statuses: CycleStatus[] = this.filter() === 'OVERDUE' ? ['OVERDUE'] : this.filter() === 'PENDING' ? ['CLOSED'] : ['OVERDUE', 'CLOSED'];
      forkJoin(statuses.map((status) => this.billingApi.listCycles({ page, size: this.size, status }))).subscribe({
        next: (pages) => {
          this.total.set(Math.max(...pages.map((p) => p.total)));
          this.setRows(pages.flatMap((p) => p.items).map((c) => ({
            key: `c${c.id}`,
            type: 'CYCLE' as const,
            targetId: c.id,
            customerId: c.customer_id,
            title: 'Estado de cuenta',
            detail: `${c.month}/${c.year}`,
            amount: c.total ?? '0',
            dueDate: c.payment_date,
            status: c.status,
            purchaseId: null,
          })));
        },
        error: (e) => this.fail(e),
      });
    }
  }

  private setRows(rows: Obligation[]): void {
    this.loading.set(false);
    this.rows.set(rows);
    const missing = [...new Set(rows.map((r) => r.customerId))].filter((id) => !this.customers()[id]);
    if (missing.length) {
      forkJoin(missing.map((id) => this.customersApi.getCustomer(id).pipe(catchError(() => of(null))))).subscribe((list) => {
        const map = { ...this.customers() };
        for (const c of list) if (c) map[c.id] = c;
        this.customers.set(map);
      });
    }
    const sel = this.selected();
    if (sel && !rows.some((r) => r.key === sel.key)) this.closeDetail();
  }

  private fail(e: unknown): void {
    this.loading.set(false);
    this.error.set(parseError(e).message);
  }

  customerName(id: number): string {
    const c = this.customers()[id];
    return c ? `${c.first_names} ${c.last_names}` : `Cuenta #${id}`;
  }

  positive(v: string): boolean {
    return Number(v) > 0;
  }

  daysLate(r: Obligation): number {
    return Math.max(0, -daysFromToday(r.dueDate));
  }

  private kindFor(r: Obligation): PaymentKind {
    if (r.type === 'CYCLE') return 'CYCLE_STATEMENT';
    return r.status === 'OVERDUE' || r.dueDate <= this.today ? 'INSTALLMENT' : 'INSTALLMENT_ADVANCE';
  }

  private target(r: Obligation): PaymentTarget {
    const kind = this.kindFor(r);
    return r.type === 'CYCLE' ? { kind, cycle_id: r.targetId } : { kind, installment_id: r.targetId };
  }

  open(r: Obligation): void {
    this.selected.set(r);
    this.quote.set(null);
    this.quoteError.set(null);
    this.quoting.set(true);
    this.billingApi.quotePayment(this.target(r)).subscribe({
      next: (q) => {
        this.quoting.set(false);
        this.quote.set(q);
      },
      error: (e) => {
        this.quoting.set(false);
        this.quoteError.set(parseError(e).message);
      },
    });
  }

  closeDetail(): void {
    this.selected.set(null);
    this.quote.set(null);
    this.quoteError.set(null);
  }

  register(): void {
    const r = this.selected();
    const q = this.quote();
    if (!r || !q) return;
    this.paying.set(true);
    this.quoteError.set(null);
    this.billingApi.registerPayment({ ...this.target(r), amount: q.total }).subscribe({
      next: (p) => {
        this.paying.set(false);
        this.toast.show(`Pago de S/ ${p.total} registrado.`);
        this.closeDetail();
        this.loadStats();
        this.load(this.page());
      },
      error: (e) => {
        this.paying.set(false);
        this.quoteError.set(parseError(e).message + ' Vuelve a cotizar.');
        this.quote.set(null);
      },
    });
  }

  /** Recordatorio por WhatsApp con el monto de hoy (no pasa por el backend). */
  reminderLink(): string | null {
    const c = this.selectedCustomer();
    const r = this.selected();
    const phone = c?.phone?.replace(/\D/g, '');
    if (!c || !r || !phone) return null;
    const amount = this.quote()?.total ?? r.amount;
    const text = `Hola ${c.first_names}, te recordamos tu pago pendiente de S/ ${amount} (${r.title} · ${r.detail}), con vencimiento el ${r.dueDate.split('-').reverse().join('/')}. ¡Gracias!`;
    const intl = phone.length === 9 ? `51${phone}` : phone;
    return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
  }
}
