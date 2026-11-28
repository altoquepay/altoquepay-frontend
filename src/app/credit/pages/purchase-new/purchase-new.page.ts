import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { Product } from '../../../catalog/model/product';
import { ProductsService } from '../../../catalog/services/products.service';
import { parseError } from '../../../core/errors/api-error';
import { CustomerAccount } from '../../../customers/model/customer';
import { CustomersService } from '../../../customers/services/customers.service';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Icon } from '../../../shared/components/icon/icon';
import { ScheduleTable } from '../../../shared/components/schedule-table/schedule-table';
import { PctPipe } from '../../../shared/pipes/pct.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { initials } from '../../../shared/utils/initials';
import { limaLocalToIso, nowLimaLocal } from '../../../shared/utils/lima-date';
import { fitGrace, graceLabel, planWeeks, termOptions, toggleGraceWeek } from '../../model/payment-plan';
import { PaymentMode, PurchaseDetail, RegisterPurchase } from '../../model/purchase';
import { PurchasesService } from '../../services/purchases.service';

interface CartLine {
  product: Product;
  quantity: number;
}

/**
 * Registro de nueva compra a crédito. El servidor pone los precios de lista y las tasas de la cuenta;
 * cada cambio vuelve a simular (POST /purchases/simulate) para mostrar el resumen antes de registrar.
 */
@Component({
  selector: 'app-purchase-new',
  templateUrl: './purchase-new.page.html',
  styleUrl: './purchase-new.page.scss',
  imports: [FormsModule, RouterLink, ErrorAlert, Icon, ScheduleTable, SolesPipe, PctPipe],
})
export class PurchaseNewPage implements OnInit {
  private readonly customersApi = inject(CustomersService);
  private readonly productsApi = inject(ProductsService);
  private readonly purchasesApi = inject(PurchasesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  readonly initials = initials;

  customer = signal<CustomerAccount | null>(null);
  customerResults = signal<CustomerAccount[]>([]);
  customerSearch$ = new Subject<string>();
  pickingCustomer = signal(true);

  productQuery = '';
  productResults = signal<Product[]>([]);
  productSearch$ = new Subject<string>();
  showProducts = signal(false);

  cart = signal<CartLine[]>([]);
  estimated = computed(() => this.cart().reduce((s, l) => s + Number(l.product.list_price) * l.quantity, 0));
  mode = signal<PaymentMode>('WEEKLY');
  /** Semanas del plan: las cuotas más las semanas de gracia. */
  term = signal(4);
  /** Semanas del plan de gracia total, elegidas por la bodega: no se paga y el interés se suma al saldo. */
  graceWeeks = signal<number[]>([]);
  /** Cada semana que no es de gracia paga una cuota. */
  installments = computed(() => this.term() - this.graceWeeks().length);
  purchasedAt = nowLimaLocal();
  readonly maxDate = nowLimaLocal();
  readonly graceLabel = graceLabel;
  private maxWeeks = computed(() => this.customer()?.max_weeks ?? 4);
  /** El plazo cabe en las semanas máximas del cliente. */
  termOptions = computed(() => termOptions(this.maxWeeks()));
  /** Las semanas del plazo, para marcar cuáles son de gracia. */
  weeks = computed(() => planWeeks(this.term(), this.graceWeeks()));

  sim = signal<PurchaseDetail | null>(null);
  simulating = signal(false);
  busy = signal(false);
  error = signal<string | null>(null);
  private simulate$ = new Subject<void>();

  ngOnInit(): void {
    const cid = this.route.snapshot.queryParamMap.get('customer');
    if (cid) this.customersApi.getCustomer(Number(cid)).subscribe((c) => this.pickCustomer(c));

    this.customerSearch$
      .pipe(debounceTime(250), distinctUntilChanged(),
        switchMap((q) => this.customersApi.listCustomers({ search: q.trim(), status: 'ACTIVE', size: 8 })),
        takeUntilDestroyed(this.destroyRef))
      .subscribe((p) => this.customerResults.set(p.items));
    this.productSearch$
      .pipe(debounceTime(250), distinctUntilChanged(),
        switchMap((q) => this.productsApi.listProducts({ search: q.trim(), active: true, size: 10 })),
        takeUntilDestroyed(this.destroyRef))
      .subscribe((p) => this.productResults.set(p.items));
    this.simulate$
      .pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.simulate());

    this.customerSearch$.next('');
    this.productSearch$.next('');
  }

  pickCustomer(c: CustomerAccount): void {
    this.customer.set(c);
    this.pickingCustomer.set(false);
    this.term.set(Math.min(this.term(), c.max_weeks));
    this.graceWeeks.set(fitGrace(this.graceWeeks(), this.term()));
    this.changed();
  }

  changeCustomer(): void {
    this.pickingCustomer.set(true);
  }

  addProduct(p: Product): void {
    const existing = this.cart().find((l) => l.product.id === p.id);
    if (existing) this.setQty(existing, existing.quantity + 1);
    else {
      this.cart.update((c) => [...c, { product: p, quantity: 1 }]);
      this.changed();
    }
    this.productQuery = '';
    this.showProducts.set(false);
  }

  setQty(l: CartLine, q: number): void {
    const quantity = Math.max(1, Math.min(10000, Math.floor(Number(q) || 1)));
    this.cart.update((c) => c.map((x) => (x === l ? { ...x, quantity } : x)));
    this.changed();
  }

  remove(l: CartLine): void {
    this.cart.update((c) => c.filter((x) => x !== l));
    this.changed();
  }

  lineTotal(l: CartLine): number {
    return Number(l.product.list_price) * l.quantity;
  }

  setMode(m: PaymentMode): void {
    this.mode.set(m);
    this.changed();
  }

  /** Un plazo más corto quita las semanas de gracia que ya no caben. */
  setTerm(n: number): void {
    this.term.set(Number(n));
    this.graceWeeks.set(fitGrace(this.graceWeeks(), this.term()));
    this.changed();
  }

  /** Vuelve de gracia una semana, o cuota otra vez; el plazo se mantiene, así que las cuotas suben. */
  toggleGrace(week: number): void {
    this.graceWeeks.set(toggleGraceWeek(this.graceWeeks(), week, this.term()));
    this.changed();
  }

  clearGrace(): void {
    this.graceWeeks.set([]);
    this.changed();
  }

  /** Invalida la simulación y vuelve a pedirla si ya hay datos suficientes. */
  changed(): void {
    this.sim.set(null);
    this.error.set(null);
    if (this.canSimulate()) this.simulate$.next();
  }

  canSimulate(): boolean {
    const c = this.customer();
    return !!c && c.status === 'ACTIVE' && this.cart().length > 0 && !!this.purchasedAt;
  }

  private body(): RegisterPurchase {
    return {
      customer_id: this.customer()!.id, // id de la CUENTA en la bodega
      purchased_at: limaLocalToIso(this.purchasedAt),
      mode: this.mode(),
      installments_count: this.mode() === 'WEEKLY' ? this.installments() : null,
      grace_weeks: this.mode() === 'WEEKLY' ? this.graceWeeks() : [],
      items: this.cart().map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
    };
  }

  simulate(): void {
    if (!this.canSimulate()) return;
    this.simulating.set(true);
    this.purchasesApi.simulatePurchase(this.body()).subscribe({
      next: (s) => {
        this.simulating.set(false);
        this.sim.set(s);
      },
      error: (e) => {
        this.simulating.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }

  register(): void {
    this.busy.set(true);
    this.error.set(null);
    this.purchasesApi.registerPurchase(this.body()).subscribe({
      next: (p) => {
        this.toast.show(`Compra #${p.id} registrada por S/ ${p.total}.`);
        this.router.navigate(['/store/purchases', p.id]);
      },
      error: (e) => {
        this.busy.set(false);
        this.sim.set(null);
        this.error.set(parseError(e).message);
      },
    });
  }
}
