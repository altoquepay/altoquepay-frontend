import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { CustomersService } from '../../../customers/services/customers.service';
import { AuthService } from '../../../iam/services/auth.service';
import { AccountOverview, CustomerStore } from '../../model/reporting';
import { ReportingService } from '../../services/reporting.service';
import { Badge } from '../../../shared/components/badge/badge';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-portal-home',
  templateUrl: './portal-home.page.html',
  styleUrl: './portal-home.page.scss',
  imports: [FormsModule, RouterLink, Badge, ErrorAlert, SolesPipe, FechaPipe],
})
export class PortalHomePage implements OnInit {
  private readonly customersApi = inject(CustomersService);
  private readonly reportingApi = inject(ReportingService);
  private toast = inject(ToastService);
  auth = inject(AuthService);
  stores = signal<CustomerStore[]>([]);
  summaries = signal<Record<number, AccountOverview | undefined>>({});
  loading = signal(true);
  error = signal<string | null>(null);
  code = '';
  linking = signal(false);
  linkError = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.reportingApi.myStores().subscribe({
      next: (list) => {
        this.loading.set(false);
        this.stores.set(list);
        for (const s of list) {
          this.reportingApi.myStoreSummary(s.store_id).subscribe({
            next: (o) => this.summaries.update((m) => ({ ...m, [s.store_id]: o })),
            error: () => {},
          });
        }
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }

  link(): void {
    this.linking.set(true);
    this.linkError.set(null);
    this.customersApi.linkStore(this.code).subscribe({
      next: () => {
        this.linking.set(false);
        this.code = '';
        this.toast.show('Bodega vinculada a tu portal.');
        this.load();
      },
      error: (e) => {
        this.linking.set(false);
        this.linkError.set(parseError(e).message);
      },
    });
  }
}
