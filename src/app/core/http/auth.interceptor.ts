import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../iam/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { environment } from '../../../environments/environment';

/** Agrega el Bearer token y maneja 401 (volver al login), PASSWORD_CHANGE_REQUIRED y STORE_INACTIVE. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const token = auth.token();
  const isApi = req.url.startsWith(environment.apiUrl);
  const isLogin = req.url.endsWith('/auth/login');

  if (token && isApi && !isLogin) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && isApi) {
        const code = (err.error as { code?: string } | null)?.code;
        if (err.status === 401 && !isLogin && token) {
          auth.logout(false);
          toast.show('Tu sesión venció. Vuelve a iniciar sesión.', 'error');
          router.navigateByUrl('/login');
        } else if (err.status === 403 && code === 'PASSWORD_CHANGE_REQUIRED') {
          auth.setMustChange(true);
          router.navigateByUrl('/change-password');
        } else if (err.status === 403 && code === 'STORE_INACTIVE' && !isLogin) {
          toast.show('Tu bodega fue desactivada. Contacta a soporte de AlToque Pay.', 'error');
          auth.logout();
        }
      }
      return throwError(() => err);
    }),
  );
};
