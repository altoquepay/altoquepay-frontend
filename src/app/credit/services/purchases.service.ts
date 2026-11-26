import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Installment, InstallmentListItem, InstallmentStatus, PaymentMode, Purchase, PurchaseDetail, RegisterPurchase } from '../model/purchase';
import { Page } from '../../shared/models/page';
import { toHttpParams } from '../../shared/utils/http-params';
import { environment } from '../../../environments/environment';

/** Compras al crédito y cuotas semanales (contexto credit). */
@Injectable({ providedIn: 'root' })
export class PurchasesService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  simulatePurchase(body: RegisterPurchase): Observable<PurchaseDetail> {
    return this.http.post<PurchaseDetail>(`${this.api}/purchases/simulate`, body);
  }
  registerPurchase(body: RegisterPurchase): Observable<PurchaseDetail> {
    return this.http.post<PurchaseDetail>(`${this.api}/purchases`, body);
  }
  listPurchases(q: { page?: number; size?: number; customer_id?: number | null; mode?: PaymentMode | ''; from?: string; to?: string }): Observable<Page<Purchase>> {
    return this.http.get<Page<Purchase>>(`${this.api}/purchases`, { params: toHttpParams(q) });
  }
  getPurchase(id: number): Observable<PurchaseDetail> {
    return this.http.get<PurchaseDetail>(`${this.api}/purchases/${id}`);
  }
  voidPurchase(id: number): Observable<PurchaseDetail> {
    return this.http.patch<PurchaseDetail>(`${this.api}/purchases/${id}/void`, {});
  }
  purchaseSchedule(id: number): Observable<Installment[]> {
    return this.http.get<Installment[]>(`${this.api}/purchases/${id}/schedule`);
  }
  listInstallments(q: { page?: number; size?: number; status?: InstallmentStatus | ''; due_before?: string }): Observable<Page<InstallmentListItem>> {
    return this.http.get<Page<InstallmentListItem>>(`${this.api}/installments`, { params: toHttpParams(q) });
  }
}
