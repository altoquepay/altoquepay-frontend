import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Payment, PaymentKind } from '../../model/billing';
import { BillingService } from '../../services/billing.service';
import { parseError } from '../../../core/errors/api-error';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Pager } from '../../../shared/components/pager/pager';
import { Page } from '../../../shared/models/page';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { LabelPipe } from '../../../shared/pipes/label.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';

@Component({
  selector: 'app-payments-list',
  templateUrl: './payment-list.page.html',
  styleUrl: './payment-list.page.scss',
  imports: [FormsModule, RouterLink, Pager, ErrorAlert, SolesPipe, LabelPipe, FechaPipe],
})
export class PaymentListPage implements OnInit {
  private readonly billingApi = inject(BillingService);
  kind: PaymentKind | '' = '';
  from = '';
  to = '';
  customerId: number | null = null;
  data = signal<Page<Payment> | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    if (this.from && this.to && this.to < this.from) {
      this.error.set('La fecha final debe ser igual o posterior a la inicial.');
      this.data.set(null);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.billingApi.listPayments({ page, size: 20, kind: this.kind, from: this.from, to: this.to, customer_id: this.customerId }).subscribe({
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
