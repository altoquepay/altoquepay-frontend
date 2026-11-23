import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../services/auth.service';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Icon } from '../../../shared/components/icon/icon';

/** Ruta /reset-password?token=… a la que apunta el link del correo. */
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
  imports: [FormsModule, RouterLink, ErrorAlert, AuthLayout, Icon],
})
export class ResetPasswordPage implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  token = '';
  p1 = '';
  p2 = '';
  loading = signal(false);
  done = signal(false);
  expired = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  submit(): void {
    if (this.p1 !== this.p2) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.resetPassword(this.token, this.p1).subscribe({
      next: () => this.done.set(true),
      error: (e) => {
        const p = parseError(e);
        this.loading.set(false);
        this.expired.set(p.code === 'INVALID_RESET_TOKEN');
        this.error.set(p.message);
      },
    });
  }
}
