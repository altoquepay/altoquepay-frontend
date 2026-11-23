import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BcrpCap, RegisterBcrpCap } from '../model/bcrp-cap';
import { environment } from '../../../environments/environment';

/** Topes de tasa del BCRP (contexto regulation). */
@Injectable({ providedIn: 'root' })
export class BcrpCapsService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  currentBcrpCap(): Observable<BcrpCap> {
    return this.http.get<BcrpCap>(`${this.api}/bcrp-caps/current`);
  }
  listBcrpCaps(): Observable<BcrpCap[]> {
    return this.http.get<BcrpCap[]>(`${this.api}/admin/bcrp-caps`);
  }
  registerBcrpCap(body: RegisterBcrpCap): Observable<BcrpCap> {
    return this.http.post<BcrpCap>(`${this.api}/admin/bcrp-caps`, body);
  }
}
