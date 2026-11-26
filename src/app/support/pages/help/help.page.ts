import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthLayout } from '../../../iam/components/auth-layout/auth-layout';
import { AuthService } from '../../../iam/services/auth.service';
import { Icon } from '../../../shared/components/icon/icon';

/** N10: preguntas frecuentes y contacto de soporte. Pública, para quien no puede iniciar sesión. */
@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrl: './help.page.scss',
  imports: [AuthLayout, RouterLink, Icon],
})
export class HelpPage {
  private readonly auth = inject(AuthService);
  readonly supportEmail = 'soporte@altoquepay.pe';
  readonly backLink = computed(() => this.auth.homeFor(this.auth.role()));
}
