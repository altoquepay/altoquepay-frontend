import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Estado del servicio (GET /health). */
@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  health(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${environment.apiHost}/health`);
  }
}
