import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductDetails } from '../model/product';
import { Page } from '../../shared/models/page';
import { toHttpParams } from '../../shared/utils/http-params';
import { environment } from '../../../environments/environment';

/** Productos de la bodega y sus imágenes (contexto catalog). */
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  /** URL completa de una imagen de producto (no requiere token). */
  imageUrl(path: string | null): string | null {
    return path ? `${environment.apiHost}${path}` : null;
  }
  listProducts(q: { page?: number; size?: number; search?: string; active?: boolean | null }): Observable<Page<Product>> {
    return this.http.get<Page<Product>>(`${this.api}/products`, { params: toHttpParams(q) });
  }
  createProduct(body: ProductDetails): Observable<Product> {
    return this.http.post<Product>(`${this.api}/products`, body);
  }
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.api}/products/${id}`);
  }
  updateProduct(id: number, body: ProductDetails): Observable<Product> {
    return this.http.put<Product>(`${this.api}/products/${id}`, body);
  }
  deactivateProduct(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.api}/products/${id}/deactivate`, {});
  }
  reactivateProduct(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.api}/products/${id}/reactivate`, {});
  }
  uploadProductImage(id: number, file: File): Observable<Product> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<Product>(`${this.api}/products/${id}/image`, form);
  }
}
