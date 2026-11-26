import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../services/auth.service';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Icon } from '../../../shared/components/icon/icon';
import { HealthService } from '../../../shared/services/health.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  imports: [FormsModule, RouterLink, ErrorAlert, AuthLayout, Icon],
})
export class LoginPage implements OnInit {
  private auth = inject(AuthService);
  private readonly healthApi = inject(HealthService);
  online = signal<boolean | null>(null);
  username = '';
  password = '';
  remember = true;
  showPassword = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // GET /health: ayuda a detectar si el backend no corre o si CORS bloquea las respuestas.
    this.healthApi.health().subscribe({ next: () => this.online.set(true), error: () => this.online.set(false) });
  }

  submit(): void {
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.username, this.password, this.remember).subscribe({
      next: () => {
        this.loading.set(false);
        this.auth.goHome();
      },
      error: (e) => {
        this.loading.set(false);
        this.auth.logout(false);
        this.error.set(parseError(e).message);
      },
    });
  }
}
