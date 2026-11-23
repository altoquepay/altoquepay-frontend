import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { PaymentMode, Purchase } from '../../model/purchase';
import { PurchasesService } from '../../services/purchases.service';
import { Badge } from '../../../shared/components/badge/badge';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Pager } from '../../../shared/components/pager/pager';
import { Page } from '../../../shared/models/page';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { LabelPipe } from '../../../shared/pipes/label.pipe';
import { PctPipe } from '../../../shared/pipes/pct.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';

@Component({
  selector: 'app-purchases-list',
  templateUrl: './purchase-list.page.html',
  styleUrl: './purchase-list.page.scss',
  imports: [FormsModule, RouterLink, Pager, Badge, ErrorAlert, SolesPipe, PctPipe, LabelPipe, FechaPipe],
})
export class PurchaseListPage implements OnInit {
  private readonly purchasesApi = inject(PurchasesService);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  mode: PaymentMode | '' = '';
  from = '';
  to = '';
  customerId: number | null = null;
  data = signal<Page<Purchase> | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const cid = this.route.snapshot.queryParamMap.get('customer_id');
    if (cid) this.customerId = Number(cid);
    this.load(1);
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.purchasesApi.listPurchases({ page, size: 20, mode: this.mode, from: this.from, to: this.to, customer_id: this.customerId }).subscribe({
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
