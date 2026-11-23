import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { Badge } from '../../../shared/components/badge/badge';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Pager } from '../../../shared/components/pager/pager';
import { Page } from '../../../shared/models/page';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { StoreListItem } from '../../model/store';
import { StoresService } from '../../services/stores.service';

@Component({
  selector: 'app-admin-stores',
  templateUrl: './admin-stores.page.html',
  styleUrl: './admin-stores.page.scss',
  imports: [RouterLink, Pager, Badge, ErrorAlert, FechaPipe],
})
export class AdminStoresPage implements OnInit {
  private readonly storesApi = inject(StoresService);
  private toast = inject(ToastService);
  data = signal<Page<StoreListItem> | null>(null);
  loading = signal(false);
  busyId = signal<number | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    this.loading.set(true);
    this.storesApi.adminListStores({ page, size: 20 }).subscribe({
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

  deactivate(s: StoreListItem): void {
    if (!confirm(`¿Desactivar "${s.business_name}"? Su administrador quedará bloqueado al instante.`)) return;
    this.change(s, 'deactivate');
  }

  reactivate(s: StoreListItem): void {
    this.change(s, 'reactivate');
  }

  private change(s: StoreListItem, action: 'deactivate' | 'reactivate'): void {
    this.busyId.set(s.id);
    this.error.set(null);
    const req = action === 'deactivate' ? this.storesApi.adminDeactivateStore(s.id) : this.storesApi.adminReactivateStore(s.id);
    req.subscribe({
      next: (store) => {
        this.busyId.set(null);
        this.data.update((d) => d && { ...d, items: d.items.map((x) => (x.id === s.id ? { ...x, status: store.status } : x)) });
        this.toast.show(action === 'deactivate' ? 'Bodega desactivada.' : 'Bodega reactivada.');
      },
      error: (e) => {
        this.busyId.set(null);
        this.error.set(parseError(e).message);
      },
    });
  }
}
