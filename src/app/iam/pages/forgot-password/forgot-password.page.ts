import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../services/auth.service';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Icon } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
  imports: [FormsModule, RouterLink, ErrorAlert, AuthLayout, Icon],
})
export class ForgotPasswordPage {
  private auth = inject(AuthService);
  email = '';
  loading = signal(false);
  sent = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    this.loading.set(true);
    this.error.set(null);
    this.auth.forgotPassword(this.email.trim()).subscribe({
      next: () => this.sent.set(true),
      error: (e) => {
        this.loading.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }
}
