import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { AuthLayout } from '../../../iam/components/auth-layout/auth-layout';
import { AuthService } from '../../../iam/services/auth.service';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Icon } from '../../../shared/components/icon/icon';
import { ToastService } from '../../../shared/services/toast.service';
import { StoresService } from '../../services/stores.service';

/** Crear cuenta: registra la bodega y su administrador (POST /stores/register) y entra con ese email. */
@Component({
  selector: 'app-register-store',
  templateUrl: './register-store.page.html',
  styleUrl: './register-store.page.scss',
  imports: [FormsModule, RouterLink, ErrorAlert, AuthLayout, Icon],
})
export class RegisterStorePage {
  private readonly storesApi = inject(StoresService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  m = { firstNames: '', lastNames: '', businessName: '', ruc: '', email: '', password: '', confirm: '', terms: false };
  showPassword = signal(false);
  showConfirm = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    if (this.m.password !== this.m.confirm) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const email = this.m.email.trim();
    this.storesApi
      .registerStore({
        business_name: this.m.businessName.trim(),
        ruc: this.m.ruc.trim(),
        full_name: `${this.m.firstNames.trim()} ${this.m.lastNames.trim()}`,
        email,
        password: this.m.password,
      })
      .subscribe({
        next: () => {
          // Flujo de la guía: registro → login con ese email → /auth/me → perfil.
          this.auth.login(email, this.m.password).subscribe({
            next: () => {
              this.toast.show('¡Cuenta creada! Revisa las condiciones de crédito de tu negocio.');
              this.router.navigateByUrl('/store/profile');
            },
            error: () => this.router.navigateByUrl('/login'),
          });
        },
        error: (e) => {
          this.loading.set(false);
          this.error.set(parseError(e).message);
        },
      });
  }
}
