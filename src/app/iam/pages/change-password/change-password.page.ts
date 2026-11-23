import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { parseError } from '../../../core/errors/api-error';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../services/auth.service';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Icon } from '../../../shared/components/icon/icon';
import { ToastService } from '../../../shared/services/toast.service';

/** Cambio de contraseña: obligatorio (must_change_password) o voluntario. */
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrl: './change-password.page.scss',
  imports: [FormsModule, ErrorAlert, AuthLayout, Icon],
})
export class ChangePasswordPage {
  auth = inject(AuthService);
  location = inject(Location);
  private toast = inject(ToastService);
  current = '';
  p1 = '';
  p2 = '';
  loading = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    if (this.p1 !== this.p2) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.changePassword(this.current, this.p1).subscribe({
      next: () => {
        this.toast.show('Contraseña actualizada.');
        this.auth.goHome();
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }
}
