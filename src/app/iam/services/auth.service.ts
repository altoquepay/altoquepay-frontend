import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { AccessToken, CurrentUser, Role } from '../model/auth';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'altoquepay.token';
const USER_KEY = 'altoquepay.user';
const MUST_CHANGE_KEY = 'altoquepay.mustChange';
const KEYS = [TOKEN_KEY, USER_KEY, MUST_CHANGE_KEY];

/** "Recordarme": la sesión va a localStorage; si no, a sessionStorage (se borra al cerrar el navegador). */
function activeStorage(): Storage {
  return sessionStorage.getItem(TOKEN_KEY) ? sessionStorage : localStorage;
}

/** Sesión: token JWT (60 min, sin refresh) y usuario actual. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = environment.apiUrl;

  private storage: Storage = activeStorage();
  readonly token = signal<string | null>(this.storage.getItem(TOKEN_KEY));
  readonly user = signal<CurrentUser | null>(readJson<CurrentUser>(this.storage, USER_KEY));
  readonly mustChangePassword = signal<boolean>(this.storage.getItem(MUST_CHANGE_KEY) === 'true');
  readonly isLoggedIn = computed(() => !!this.token());
  readonly role = computed<Role | null>(() => this.user()?.role ?? null);

  /** POST /auth/login como formulario x-www-form-urlencoded. */
  login(username: string, password: string, remember = true): Observable<CurrentUser> {
    this.clearStorage();
    this.storage = remember ? localStorage : sessionStorage;
    const body = new HttpParams().set('username', username.trim()).set('password', password);
    return this.http.post<AccessToken>(`${this.api}/auth/login`, body).pipe(
      tap((t) => this.saveToken(t)),
      switchMap(() => this.loadMe()),
    );
  }

  /** GET /auth/me */
  loadMe(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.api}/auth/me`).pipe(
      tap((u) => {
        this.user.set(u);
        this.storage.setItem(USER_KEY, JSON.stringify(u));
        this.setMustChange(u.must_change_password);
      }),
    );
  }

  /** POST /auth/change-password: devuelve un token nuevo; los anteriores dejan de servir. */
  changePassword(current_password: string, new_password: string): Observable<CurrentUser> {
    return this.http
      .post<AccessToken>(`${this.api}/auth/change-password`, { current_password, new_password })
      .pipe(
        tap((t) => this.saveToken(t)),
        switchMap(() => this.loadMe()),
      );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.api}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, new_password: string): Observable<void> {
    return this.http.post<void>(`${this.api}/auth/reset-password`, { token, new_password });
  }

  redeemAccessCode(dni: string, code: string, new_password: string): Observable<void> {
    return this.http.post<void>(`${this.api}/auth/redeem-access-code`, {
      dni: dni.trim(),
      code: code.replace(/\s+/g, '').toUpperCase(),
      new_password,
    });
  }

  /** Ruta de inicio según el rol. */
  homeFor(role: Role | null): string {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return '/admin/stores';
      case 'STORE_ADMIN':
        return '/store/dashboard';
      case 'CUSTOMER':
        return '/portal';
      default:
        return '/login';
    }
  }

  goHome(): void {
    if (this.mustChangePassword()) {
      this.router.navigateByUrl('/change-password');
    } else {
      this.router.navigateByUrl(this.homeFor(this.role()));
    }
  }

  logout(redirect = true): void {
    this.token.set(null);
    this.user.set(null);
    this.mustChangePassword.set(false);
    this.clearStorage();
    if (redirect) this.router.navigateByUrl('/login');
  }

  setMustChange(v: boolean): void {
    this.mustChangePassword.set(v);
    this.storage.setItem(MUST_CHANGE_KEY, String(v));
  }

  private clearStorage(): void {
    for (const k of KEYS) {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    }
  }

  private saveToken(t: AccessToken): void {
    this.token.set(t.access_token);
    this.storage.setItem(TOKEN_KEY, t.access_token);
    this.setMustChange(t.must_change_password);
  }
}

function readJson<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
