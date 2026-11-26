import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../../iam/model/auth';
import { AuthService } from '../../iam/services/auth.service';

/** Requiere sesión y, si hay cambio de contraseña pendiente, lo exige primero. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return router.parseUrl('/login');
  if (auth.mustChangePassword()) return router.parseUrl('/change-password');
  return true;
};

/** Solo sesión (para la pantalla de cambio de contraseña). */
export const sessionGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : inject(Router).parseUrl('/login');
};

/** Pantallas públicas: si ya hay sesión, manda al inicio del rol. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.isLoggedIn() || !auth.role()) return true;
  const router = inject(Router);
  return router.parseUrl(auth.mustChangePassword() ? '/change-password' : auth.homeFor(auth.role()));
};

export function roleGuard(...roles: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const role = auth.role();
    if (role && roles.includes(role)) return true;
    return inject(Router).parseUrl(auth.homeFor(role));
  };
}
