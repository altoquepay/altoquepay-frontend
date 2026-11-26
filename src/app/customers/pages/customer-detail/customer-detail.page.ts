import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Cycle, Payment } from '../../../billing/model/billing';
import { BillingService } from '../../../billing/services/billing.service';
import { parseError } from '../../../core/errors/api-error';
import { Purchase } from '../../../credit/model/purchase';
import { PurchasesService } from '../../../credit/services/purchases.service';
import { AccessCodeCard } from '../../components/access-code-card/access-code-card';
import { AccessCode, CustomerAccount, UpdateAccount } from '../../model/customer';
import { CustomersService } from '../../services/customers.service';
import { Badge } from '../../../shared/components/badge/badge';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Pager } from '../../../shared/components/pager/pager';
import { Page } from '../../../shared/models/page';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { LabelPipe } from '../../../shared/pipes/label.pipe';
import { MesPipe } from '../../../shared/pipes/mes.pipe';
import { PctPipe } from '../../../shared/pipes/pct.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { Icon } from '../../../shared/components/icon/icon';
import { isValidPhone, PHONE_PATTERN, phoneProblem } from '../../../shared/utils/phone';

type Tab = 'purchases' | 'cycles' | 'payments' | 'edit';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.page.html',
  styleUrl: './customer-detail.page.scss',
  imports: [FormsModule, RouterLink, Pager, Badge, ErrorAlert, AccessCodeCard, SolesPipe, PctPipe, LabelPipe, FechaPipe, MesPipe, Icon],
})
export class CustomerDetailPage implements OnInit {
  private readonly billingApi = inject(BillingService);
  private readonly customersApi = inject(CustomersService);
  private readonly purchasesApi = inject(PurchasesService);
  private toast = inject(ToastService);
  id = input.required<string>();
  acc = signal<CustomerAccount | null>(null);
  code = signal<AccessCode | null>(null);
  tab = signal<Tab>('purchases');
  purchases = signal<Page<Purchase> | null>(null);
  cycles = signal<Page<Cycle> | null>(null);
  payments = signal<Page<Payment> | null>(null);
  busy = signal(false);
  error = signal<string | null>(null);
  m!: UpdateAccount;
  readonly phonePattern = PHONE_PATTERN;
  readonly phoneProblem = phoneProblem;

  private get accountId(): number {
    return Number(this.id());
  }

  ngOnInit(): void {
    this.customersApi.getCustomer(this.accountId).subscribe({
      next: (a) => this.fill(a),
      error: (e) => this.error.set(parseError(e).message),
    });
    this.loadPurchases(1);
  }

  setTab(t: Tab): void {
    this.tab.set(t);
    if (t === 'cycles' && !this.cycles()) this.loadCycles(1);
    if (t === 'payments' && !this.payments()) this.loadPayments(1);
  }

  loadPurchases(page: number): void {
    this.purchasesApi.listPurchases({ page, size: 10, customer_id: this.accountId }).subscribe((d) => this.purchases.set(d));
  }
  loadCycles(page: number): void {
    this.billingApi.listCycles({ page, size: 12, customer_id: this.accountId }).subscribe((d) => this.cycles.set(d));
  }
  loadPayments(page: number): void {
    this.billingApi.listPayments({ page, size: 10, customer_id: this.accountId }).subscribe((d) => this.payments.set(d));
  }

  private fill(a: CustomerAccount): void {
    this.acc.set(a);
    this.m = {
      first_names: a.first_names, last_names: a.last_names, phone: a.phone, address: a.address,
      credit_limit: a.credit_limit, cutoff_day: a.cutoff_day, payment_day: a.payment_day,
      tea: a.tea, late_tea: a.late_tea, max_weeks: a.max_weeks,
    };
  }

  save(): void {
    if (!isValidPhone(this.m.phone)) {
      this.error.set(phoneProblem(this.m.phone));
      return;
    }
    if (this.m.payment_day <= this.m.cutoff_day) {
      this.error.set('El día de pago debe ser posterior al día de corte.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    const body: UpdateAccount = {
      ...this.m,
      phone: this.m.phone?.trim() || null,
      address: this.m.address?.trim() || null,
      credit_limit: String(this.m.credit_limit),
      tea: String(this.m.tea),
      late_tea: String(this.m.late_tea),
    };
    this.customersApi.updateCustomer(this.accountId, body).subscribe({
      next: (a) => {
        this.busy.set(false);
        this.fill(a);
        this.toast.show('Datos actualizados.');
      },
      error: (e) => this.fail(e),
    });
  }

  deactivate(): void {
    if (!confirm('¿Desactivar esta cuenta? El cliente ya no podrá comprar al crédito en tu bodega. Sus compras y pagos se mantienen.')) return;
    this.busy.set(true);
    this.customersApi.deactivateCustomer(this.accountId).subscribe({
      next: (a) => {
        this.busy.set(false);
        this.fill(a);
        this.toast.show('Cuenta desactivada.');
      },
      error: (e) => this.fail(e),
    });
  }

  /** Permite comprar al crédito otra vez, con la línea y las condiciones que la cuenta tiene ahora. */
  reactivate(): void {
    this.busy.set(true);
    this.customersApi.reactivateCustomer(this.accountId).subscribe({
      next: (a) => {
        this.busy.set(false);
        this.fill(a);
        this.toast.show('Cuenta reactivada: ya puede comprar al crédito otra vez.');
      },
      error: (e) => this.fail(e),
    });
  }

  newCode(): void {
    this.busy.set(true);
    this.customersApi.newAccessCode(this.accountId).subscribe({
      next: (c) => {
        this.busy.set(false);
        this.code.set(c);
      },
      error: (e) => this.fail(e),
    });
  }

  private fail(e: unknown): void {
    this.busy.set(false);
    this.error.set(parseError(e).message);
  }
}
