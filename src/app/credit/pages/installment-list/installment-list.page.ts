import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { InstallmentListItem, InstallmentStatus } from '../../model/purchase';
import { PurchasesService } from '../../services/purchases.service';
import { Badge } from '../../../shared/components/badge/badge';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Pager } from '../../../shared/components/pager/pager';
import { Page } from '../../../shared/models/page';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { todayLima } from '../../../shared/utils/lima-date';

@Component({
  selector: 'app-installments',
  templateUrl: './installment-list.page.html',
  styleUrl: './installment-list.page.scss',
  imports: [FormsModule, RouterLink, Pager, Badge, ErrorAlert, SolesPipe, FechaPipe],
})
export class InstallmentListPage implements OnInit {
  private readonly purchasesApi = inject(PurchasesService);
  private route = inject(ActivatedRoute);
  today = todayLima();
  status: InstallmentStatus | '' = 'PENDING';
  dueBefore = '';
  data = signal<Page<InstallmentListItem> | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    if (q.has('status')) this.status = (q.get('status') ?? '') as InstallmentStatus | '';
    if (q.has('due_before')) this.dueBefore = q.get('due_before') ?? '';
    this.load(1);
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.purchasesApi.listInstallments({ page, size: 20, status: this.status, due_before: this.dueBefore }).subscribe({
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
