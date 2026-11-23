import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountOverview, CustomerStore, CycleStatement, Dashboard, PeriodReport, PortalPurchase, PurchaseSchedule } from '../model/reporting';
import { toHttpParams } from '../../shared/utils/http-params';
import { environment } from '../../../environments/environment';

/** Dashboard, reportes y portal del cliente (contexto reporting). */
@Injectable({ providedIn: 'root' })
export class ReportingService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  dashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.api}/dashboard`);
  }
  reportSummary(from: string, to: string): Observable<PeriodReport> {
    return this.http.get<PeriodReport>(`${this.api}/reports/summary`, { params: toHttpParams({ from, to }) });
  }
  myStores(): Observable<CustomerStore[]> {
    return this.http.get<CustomerStore[]>(`${this.api}/me/stores`);
  }
  myStoreSummary(storeId: number): Observable<AccountOverview> {
    return this.http.get<AccountOverview>(`${this.api}/me/stores/${storeId}/summary`);
  }
  myStatement(storeId: number, year: number, month: number): Observable<CycleStatement> {
    return this.http.get<CycleStatement>(`${this.api}/me/stores/${storeId}/cycles/${year}/${month}`);
  }
  myPurchases(storeId: number): Observable<PortalPurchase[]> {
    return this.http.get<PortalPurchase[]>(`${this.api}/me/stores/${storeId}/purchases`);
  }
  myPurchaseSchedule(storeId: number, purchaseId: number): Observable<PurchaseSchedule> {
    return this.http.get<PurchaseSchedule>(`${this.api}/me/stores/${storeId}/purchases/${purchaseId}/schedule`);
  }
}
