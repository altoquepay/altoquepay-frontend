import { Location } from '@angular/common';
import { graceLabel, planRows } from '../../model/payment-plan';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Cycle } from '../../../billing/model/billing';
import { BillingService } from '../../../billing/services/billing.service';
import { Product } from '../../../catalog/model/product';
import { ProductsService } from '../../../catalog/services/products.service';
import { parseError } from '../../../core/errors/api-error';
import { CustomerAccount } from '../../../customers/model/customer';
import { CustomersService } from '../../../customers/services/customers.service';
import { Badge, BadgeTone } from '../../../shared/components/badge/badge';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Icon } from '../../../shared/components/icon/icon';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { LabelPipe } from '../../../shared/pipes/label.pipe';
import { PctPipe } from '../../../shared/pipes/pct.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { downloadBlob } from '../../../shared/utils/download';
import { initials } from '../../../shared/utils/initials';
import { daysFromToday, todayLima } from '../../../shared/utils/lima-date';
import { Installment, PurchaseDetail } from '../../model/purchase';
import { PurchasesService } from '../../services/purchases.service';

/** Estado de cuenta / plan de pagos de una compra: cronograma de hoy, resumen y acciones de cobro. */
@Component({
  selector: 'app-purchase-detail',
  templateUrl: './purchase-detail.page.html',
  styleUrl: './purchase-detail.page.scss',
  imports: [RouterLink, Badge, ErrorAlert, Icon, SolesPipe, PctPipe, LabelPipe, FechaPipe],
})
export class PurchaseDetailPage implements OnInit {
  readonly graceLabel = graceLabel;
  readonly planRows = planRows;
  private readonly productsApi = inject(ProductsService);
  private readonly purchasesApi = inject(PurchasesService);
  private readonly customersApi = inject(CustomersService);
  private readonly billingApi = inject(BillingService);
  private readonly toast = inject(ToastService);
  protected readonly location = inject(Location);
  readonly initials = initials;

  id = input.required<string>();
  p = signal<PurchaseDetail | null>(null);
  schedule = signal<Installment[]>([]);
  products = signal<Record<number, Product | undefined>>({});
  account = signal<CustomerAccount | null>(null);
  cycle = signal<Cycle | null>(null);
  busy = signal(false);
  downloading = signal(false);
  error = signal<string | null>(null);
  private readonly today = todayLima();

  /** Las cuotas se pagan en orden: solo la primera pendiente o vencida se puede cobrar. */
  nextPayable = computed(() => this.schedule().find((i) => i.status === 'PENDING' || i.status === 'OVERDUE') ?? null);
  /** Lo que falta pagar de la compra. */
  pending = computed(() => {
    const p = this.p();
    if (!p || p.status !== 'ACTIVE') return 0;
    if (p.mode === 'SINGLE_DATE') return Number(p.total);
    return this.schedule()
      .filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE')
      .reduce((s, i) => s + Number(i.amount), 0);
  });
  usedPct = computed(() => {
    const a = this.account();
    const p = this.p();
    if (!a || !p || !Number(a.credit_limit)) return 0;
    return Math.min(100, Math.round((Number(p.amount) / Number(a.credit_limit)) * 100));
  });
  productSummary = computed(() => {
    const p = this.p();
    if (!p?.items.length) return '—';
    const first = this.products()[p.items[0].product_id]?.description ?? `Producto #${p.items[0].product_id}`;
    return p.items.length > 1 ? `${first} y ${p.items.length - 1} más` : first;
  });
  nextDue = computed(() => {
    const p = this.p();
    if (!p || p.status !== 'ACTIVE') return null;
    if (p.mode === 'WEEKLY') return this.nextPayable()?.due_date ?? null;
    return this.cycle()?.payment_date ?? null;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = Number(this.id());
    this.purchasesApi.getPurchase(id).subscribe({
      next: (p) => {
        this.p.set(p);
        this.schedule.set(p.installments);
        if (p.mode === 'WEEKLY') this.purchasesApi.purchaseSchedule(id).subscribe((s) => this.schedule.set(s));
        this.customersApi.getCustomer(p.customer_id).subscribe({ next: (a) => this.account.set(a), error: () => {} });
        this.billingApi.listCycles({ customer_id: p.customer_id, size: 100 }).subscribe({
          next: (page) => this.cycle.set(page.items.find((c) => c.id === p.cycle_id) ?? null),
          error: () => {},
        });
        const ids = [...new Set(p.items.map((i) => i.product_id))];
        if (ids.length) {
          forkJoin(ids.map((pid) => this.productsApi.getProduct(pid).pipe(catchError(() => of(null))))).subscribe((list) => {
            const map: Record<number, Product> = {};
            for (const prod of list) if (prod) map[prod.id] = prod;
            this.products.set(map);
          });
        }
      },
      error: (e) => this.error.set(parseError(e).message),
    });
  }

  daysLeft(date: string): number {
    return daysFromToday(date);
  }

  daysAgo(date: string): number {
    return Math.abs(daysFromToday(date));
  }

  /** Pagado, Próxima, Pendiente, Vencido o Cancelada. */
  status(i: Installment): { label: string | null; tone: BadgeTone | null } {
    if (i.id !== null && i.id === this.nextPayable()?.id && i.status === 'PENDING') return { label: 'Próxima', tone: 'info' };
    return { label: null, tone: null };
  }

  payKind(i: Installment): 'INSTALLMENT' | 'INSTALLMENT_ADVANCE' {
    return i.status === 'OVERDUE' || i.due_date <= this.today ? 'INSTALLMENT' : 'INSTALLMENT_ADVANCE';
  }

  /** Destino del botón "Registrar pago" según la modalidad y el estado del ciclo. */
  payLink(): { kind: string; [key: string]: string | number } | null {
    const p = this.p();
    if (!p || p.status !== 'ACTIVE') return null;
    if (p.mode === 'WEEKLY') {
      const next = this.nextPayable();
      return next?.id ? { kind: this.payKind(next), installment_id: next.id } : null;
    }
    const c = this.cycle();
    if (c && (c.status === 'CLOSED' || c.status === 'OVERDUE')) return { kind: 'CYCLE_STATEMENT', cycle_id: c.id };
    return { kind: 'SINGLE_DATE_EARLY', purchase_id: p.id ?? 0 };
  }

  downloadStatement(): void {
    const c = this.cycle();
    const p = this.p();
    if (!c || !p) return;
    this.downloading.set(true);
    this.billingApi.getStatementPdf(p.customer_id, c.year, c.month).subscribe({
      next: (b) => {
        this.downloading.set(false);
        downloadBlob(b, `estado-de-cuenta-${p.customer_id}-${c.year}-${String(c.month).padStart(2, '0')}.pdf`);
      },
      error: (e) => {
        this.downloading.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }

  voidIt(): void {
    if (!confirm('¿Anular esta compra? Solo se puede si no tiene nada pagado y su ciclo sigue abierto. Se cancelan sus cuotas.')) return;
    this.busy.set(true);
    this.error.set(null);
    this.purchasesApi.voidPurchase(Number(this.id())).subscribe({
      next: (p) => {
        this.busy.set(false);
        this.p.set(p);
        this.schedule.set(p.installments);
        this.toast.show('Compra anulada.');
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }
}
