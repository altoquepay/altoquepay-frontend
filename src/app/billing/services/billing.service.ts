import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cycle, CycleStatus, Payment, PaymentKind, PaymentQuote, PaymentTarget, RegisterPayment, Statement } from '../model/billing';
import { Page } from '../../shared/models/page';
import { toHttpParams } from '../../shared/utils/http-params';
import { environment } from '../../../environments/environment';

/** Ciclos, estados de cuenta y pagos (contexto billing). */
@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listCycles(q: { page?: number; size?: number; year?: number | null; month?: number | null; status?: CycleStatus | ''; customer_id?: number | null }): Observable<Page<Cycle>> {
    return this.http.get<Page<Cycle>>(`${this.api}/cycles`, { params: toHttpParams(q) });
  }
  getStatement(accountId: number, year: number, month: number): Observable<Statement> {
    return this.http.get<Statement>(`${this.api}/customers/${accountId}/cycles/${year}/${month}`);
  }
  getStatementPdf(accountId: number, year: number, month: number): Observable<Blob> {
    return this.http.get(`${this.api}/customers/${accountId}/cycles/${year}/${month}/pdf`, { responseType: 'blob' });
  }
  quotePayment(body: PaymentTarget): Observable<PaymentQuote> {
    return this.http.post<PaymentQuote>(`${this.api}/payments/quote`, body);
  }
  registerPayment(body: RegisterPayment): Observable<Payment> {
    return this.http.post<Payment>(`${this.api}/payments`, body);
  }
  listPayments(q: { page?: number; size?: number; customer_id?: number | null; kind?: PaymentKind | ''; from?: string; to?: string }): Observable<Page<Payment>> {
    return this.http.get<Page<Payment>>(`${this.api}/payments`, { params: toHttpParams(q) });
  }
}
