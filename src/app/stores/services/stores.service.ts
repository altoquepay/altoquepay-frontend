import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '../../shared/models/page';
import { toHttpParams } from '../../shared/utils/http-params';
import { RegisterStore, Store, StoreListItem, UpdateStoreProfile } from '../model/store';
import { environment } from '../../../environments/environment';

/** Bodegas: registro, perfil y administración (contexto stores). */
@Injectable({ providedIn: 'root' })
export class StoresService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  registerStore(body: RegisterStore): Observable<Store> {
    return this.http.post<Store>(`${this.api}/stores/register`, body);
  }
  getProfile(): Observable<Store> {
    return this.http.get<Store>(`${this.api}/store/profile`);
  }
  updateProfile(body: UpdateStoreProfile): Observable<Store> {
    return this.http.put<Store>(`${this.api}/store/profile`, body);
  }
  adminListStores(q: { page?: number; size?: number }): Observable<Page<StoreListItem>> {
    return this.http.get<Page<StoreListItem>>(`${this.api}/admin/stores`, { params: toHttpParams(q) });
  }
  adminDeactivateStore(id: number): Observable<Store> {
    return this.http.patch<Store>(`${this.api}/admin/stores/${id}/deactivate`, {});
  }
  adminReactivateStore(id: number): Observable<Store> {
    return this.http.patch<Store>(`${this.api}/admin/stores/${id}/reactivate`, {});
  }
}
