import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../services/auth.service';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Icon } from '../../../shared/components/icon/icon';

/** Cliente sin sesión: activa o recupera su acceso con el código de su bodega. */
@Component({
  selector: 'app-redeem-code',
  templateUrl: './redeem-access-code.page.html',
  styleUrl: './redeem-access-code.page.scss',
  imports: [FormsModule, RouterLink, ErrorAlert, AuthLayout, Icon],
})
export class RedeemAccessCodePage {
  private auth = inject(AuthService);
  dni = '';
  code = '';
  p1 = '';
  p2 = '';
  loading = signal(false);
  done = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    if (this.p1 !== this.p2) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.redeemAccessCode(this.dni, this.code, this.p1).subscribe({
      next: () => this.done.set(true),
      error: (e) => {
        this.loading.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }
}
