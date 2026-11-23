import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Payment, PaymentKind, PaymentQuote, PaymentTarget } from '../../model/billing';
import { BillingService } from '../../services/billing.service';
import { parseError } from '../../../core/errors/api-error';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { LabelPipe } from '../../../shared/pipes/label.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { todayLima } from '../../../shared/utils/lima-date';

interface KindInfo {
  kind: PaymentKind;
  label: string;
  target: 'cycle_id' | 'installment_id' | 'purchase_id';
  targetLabel: string;
  help: string;
}

const KINDS: KindInfo[] = [
  { kind: 'CYCLE_STATEMENT', label: 'Estado de cuenta', target: 'cycle_id', targetLabel: 'ID del ciclo', help: 'Pagar el estado de cuenta de un ciclo cerrado.' },
  { kind: 'INSTALLMENT', label: 'Cuota', target: 'installment_id', targetLabel: 'ID de la cuota', help: 'Pagar una cuota semanal que vence hoy o ya venció. Van en orden.' },
  { kind: 'INSTALLMENT_ADVANCE', label: 'Adelanto de cuota', target: 'installment_id', targetLabel: 'ID de la cuota', help: 'Adelantar una cuota semanal antes de su fecha.' },
  { kind: 'SINGLE_DATE_EARLY', label: 'Fecha única anticipada', target: 'purchase_id', targetLabel: 'ID de la compra', help: 'Pagar una compra de fecha única antes del cierre de su ciclo.' },
  { kind: 'FULL_PREPAYMENT', label: 'Prepago total', target: 'purchase_id', targetLabel: 'ID de la compra', help: 'Cancelar todo lo que falta de una compra semanal (sin cuotas vencidas).' },
];

/** Cobro: cotizar con POST /payments/quote y registrar con el mismo body + amount = total. */
@Component({
  selector: 'app-payment-new',
  templateUrl: './payment-new.page.html',
  styleUrl: './payment-new.page.scss',
  imports: [FormsModule, RouterLink, ErrorAlert, SolesPipe, LabelPipe, FechaPipe],
})
export class PaymentNewPage implements OnInit {
  private readonly billingApi = inject(BillingService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  kinds = KINDS;
  today = todayLima();
  kind: PaymentKind = 'INSTALLMENT';
  targetId: number | null = null;
  quote = signal<PaymentQuote | null>(null);
  done = signal<Payment | null>(null);
  busy = signal(false);
  error = signal<string | null>(null);

  info(): KindInfo {
    return KINDS.find((k) => k.kind === this.kind)!;
  }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    const kind = q.get('kind') as PaymentKind | null;
    if (kind && KINDS.some((k) => k.kind === kind)) {
      this.kind = kind;
      const id = q.get(this.info().target);
      if (id) {
        this.targetId = Number(id);
        this.doQuote();
      }
    }
  }

  positive(v: string): boolean {
    return Number(v) > 0;
  }

  /** Cada tipo lleva exactamente uno de los ids (si no, 422 INVALID_PAYMENT_TARGET). */
  private target(): PaymentTarget {
    const t: PaymentTarget = { kind: this.kind };
    t[this.info().target] = Number(this.targetId);
    return t;
  }

  doQuote(): void {
    this.busy.set(true);
    this.error.set(null);
    this.quote.set(null);
    this.billingApi.quotePayment(this.target()).subscribe({
      next: (q) => {
        this.busy.set(false);
        this.quote.set(q);
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }

  register(q: PaymentQuote): void {
    this.busy.set(true);
    this.error.set(null);
    this.billingApi.registerPayment({ ...this.target(), amount: q.total }).subscribe({
      next: (p) => {
        this.busy.set(false);
        this.done.set(p);
        this.toast.show('Pago registrado.');
      },
      error: (e) => {
        this.busy.set(false);
        this.quote.set(null);
        this.error.set(parseError(e).message + ' Vuelve a cotizar.');
      },
    });
  }

  reset(): void {
    this.done.set(null);
    this.quote.set(null);
    this.targetId = null;
  }
}
