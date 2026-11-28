import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Product } from '../../model/product';
import { ProductsService } from '../../services/products.service';
import { parseError } from '../../../core/errors/api-error';
import { Badge } from '../../../shared/components/badge/badge';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { countEach, FilterChips, FilterOption } from '../../../shared/components/filter-chips/filter-chips';
import { Pager } from '../../../shared/components/pager/pager';
import { SearchBox } from '../../../shared/components/search-box/search-box';
import { Page } from '../../../shared/models/page';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';

type ActiveFilter = '' | 'true' | 'false';
const FILTERS: FilterOption<ActiveFilter>[] = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Activos', tone: 'ok' },
  { value: 'false', label: 'Inactivos' },
];

@Component({
  selector: 'app-products-list',
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
  imports: [RouterLink, Pager, Badge, EmptyState, ErrorAlert, FilterChips, SearchBox, SolesPipe],
})
export class ProductListPage implements OnInit {
  protected readonly productsApi = inject(ProductsService);
  router = inject(Router);
  search = signal('');
  active = signal<ActiveFilter>('');
  data = signal<Page<Product> | null>(null);
  counts = signal<Partial<Record<ActiveFilter, number>>>({});
  loading = signal(false);
  error = signal<string | null>(null);

  options = computed(() => FILTERS.map((f) => ({ ...f, count: this.counts()[f.value] ?? null })));

  ngOnInit(): void {
    this.refresh();
  }

  setActive(active: ActiveFilter): void {
    this.active.set(active);
    this.load(1);
  }

  setSearch(text: string): void {
    this.search.set(text);
    this.refresh();
  }

  clearFilters(): void {
    this.search.set('');
    this.active.set('');
    this.refresh();
  }

  /** Reloads the list and how many products each chip leaves for the current search. */
  refresh(): void {
    this.load(1);
    const search = this.search().trim();
    countEach(FILTERS, (value) =>
      this.productsApi.listProducts({ page: 1, size: 1, search, active: toActive(value) }).pipe(map((p) => p.total)),
    ).subscribe({ next: (counts) => this.counts.set(counts), error: () => this.counts.set({}) });
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.productsApi.listProducts({ page, size: 20, search: this.search().trim(), active: toActive(this.active()) }).subscribe({
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

function toActive(filter: ActiveFilter): boolean | null {
  return filter === '' ? null : filter === 'true';
}
