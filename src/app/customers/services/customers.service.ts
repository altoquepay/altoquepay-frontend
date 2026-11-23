import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessCode, AccountStatus, CustomerAccount, OpenAccount, OpenedAccount, PersonLookup, UpdateAccount } from '../model/customer';
import { Page } from '../../shared/models/page';
import { toHttpParams } from '../../shared/utils/http-params';
import { environment } from '../../../environments/environment';

/** Cuentas de clientes, códigos de acceso y bodega de confianza (contexto customers). */
@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listCustomers(q: { page?: number; size?: number; search?: string; status?: AccountStatus | '' }): Observable<Page<CustomerAccount>> {
    return this.http.get<Page<CustomerAccount>>(`${this.api}/customers`, { params: toHttpParams(q) });
  }
  openAccount(body: OpenAccount): Observable<OpenedAccount> {
    return this.http.post<OpenedAccount>(`${this.api}/customers`, body);
  }
  lookupPerson(dni: string): Observable<PersonLookup> {
    return this.http.get<PersonLookup>(`${this.api}/customers/lookup`, { params: toHttpParams({ dni }) });
  }
  getCustomer(accountId: number): Observable<CustomerAccount> {
    return this.http.get<CustomerAccount>(`${this.api}/customers/${accountId}`);
  }
  updateCustomer(accountId: number, body: UpdateAccount): Observable<CustomerAccount> {
    return this.http.put<CustomerAccount>(`${this.api}/customers/${accountId}`, body);
  }
  deactivateCustomer(accountId: number): Observable<CustomerAccount> {
    return this.http.patch<CustomerAccount>(`${this.api}/customers/${accountId}/deactivate`, {});
  }
  newAccessCode(accountId: number): Observable<AccessCode> {
    return this.http.post<AccessCode>(`${this.api}/customers/${accountId}/access-code`, {});
  }
  linkStore(code: string): Observable<void> {
    return this.http.post<void>(`${this.api}/me/stores/link`, { code: code.replace(/\s+/g, '').toUpperCase() });
  }
  adminTrustStore(dni: string, store_id: number): Observable<void> {
    return this.http.post<void>(`${this.api}/admin/customers/trusted-store`, { dni, store_id });
  }
}
