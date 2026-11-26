import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Product, ProductDetails } from '../../model/product';
import { ProductsService } from '../../services/products.service';
import { parseError } from '../../../core/errors/api-error';
import { Badge } from '../../../shared/components/badge/badge';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { ToastService } from '../../../shared/services/toast.service';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Crear (sin id) o editar producto, con imagen, desactivación y reactivación. */
@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.page.html',
  styleUrl: './product-form.page.scss',
  imports: [FormsModule, RouterLink, Badge, ErrorAlert],
})
export class ProductFormPage implements OnInit {
  protected readonly productsApi = inject(ProductsService);
  private router = inject(Router);
  private toast = inject(ToastService);
  id = input<string>();
  product = signal<Product | null>(null);
  busy = signal(false);
  uploading = signal(false);
  error = signal<string | null>(null);
  m: ProductDetails = { code: '', description: '', brand: '', category: '', unit: 'UND', supplier: null, cash_price: '', list_price: '' };

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      this.productsApi.getProduct(Number(id)).subscribe({
        next: (p) => this.fill(p),
        error: (e) => this.error.set(parseError(e).message),
      });
    }
  }

  private fill(p: Product): void {
    this.product.set(p);
    this.m = {
      code: p.code, description: p.description, brand: p.brand, category: p.category, unit: p.unit,
      supplier: p.supplier, cash_price: p.cash_price, list_price: p.list_price,
    };
  }

  save(): void {
    this.busy.set(true);
    this.error.set(null);
    const body: ProductDetails = {
      ...this.m,
      supplier: this.m.supplier?.trim() || null,
      cash_price: String(this.m.cash_price),
      list_price: String(this.m.list_price),
    };
    const p = this.product();
    const req = p ? this.productsApi.updateProduct(p.id, body) : this.productsApi.createProduct(body);
    req.subscribe({
      next: (saved) => {
        this.busy.set(false);
        this.toast.show(p ? 'Producto actualizado.' : 'Producto creado. Ahora puedes subir su imagen.');
        if (p) this.fill(saved);
        else this.router.navigate(['/store/products', saved.id]);
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }

  deactivate(): void {
    const p = this.product();
    if (!p || !confirm('¿Dejar de vender este producto? Sigue listado y las compras pasadas no cambian.')) return;
    this.busy.set(true);
    this.productsApi.deactivateProduct(p.id).subscribe({
      next: (x) => {
        this.busy.set(false);
        this.fill(x);
        this.toast.show('Producto desactivado.');
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }

  /** Vuelve a vender un producto desactivado, con los datos y precios que tiene ahora. */
  reactivate(): void {
    const p = this.product();
    if (!p) return;
    this.busy.set(true);
    this.error.set(null);
    this.productsApi.reactivateProduct(p.id).subscribe({
      next: (x) => {
        this.busy.set(false);
        this.fill(x);
        this.toast.show('Producto activo otra vez: ya se puede vender.');
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }

  upload(ev: Event): void {
    const inputEl = ev.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    const p = this.product();
    if (!file || !p) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      this.error.set('La imagen debe ser JPEG, PNG o WebP.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.error.set('La imagen debe pesar como máximo 2 MB.');
      return;
    }
    this.uploading.set(true);
    this.error.set(null);
    this.productsApi.uploadProductImage(p.id, file).subscribe({
      next: (x) => {
        this.uploading.set(false);
        this.fill(x);
        this.toast.show('Imagen actualizada.');
      },
      error: (e) => {
        this.uploading.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }
}
