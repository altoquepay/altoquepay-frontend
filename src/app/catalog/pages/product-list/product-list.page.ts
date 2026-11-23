import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../model/product';
import { ProductsService } from '../../services/products.service';
import { parseError } from '../../../core/errors/api-error';
import { Badge } from '../../../shared/components/badge/badge';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Pager } from '../../../shared/components/pager/pager';
import { Page } from '../../../shared/models/page';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';

@Component({
  selector: 'app-products-list',
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
  imports: [FormsModule, RouterLink, Pager, Badge, ErrorAlert, SolesPipe],
})
export class ProductListPage implements OnInit {
  protected readonly productsApi = inject(ProductsService);
  router = inject(Router);
  search = '';
  active: '' | 'true' | 'false' = '';
  data = signal<Page<Product> | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    this.loading.set(true);
    const active = this.active === '' ? null : this.active === 'true';
    this.productsApi.listProducts({ page, size: 20, search: this.search.trim(), active }).subscribe({
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
