import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { parseError } from '../../../core/errors/api-error';
import { CustomersService } from '../../services/customers.service';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { ToastService } from '../../../shared/services/toast.service';

/** Soporte: fija la bodega de confianza que puede restaurar el acceso de un cliente. */
@Component({
  selector: 'app-admin-trusted-store',
  templateUrl: './trusted-store.page.html',
  styleUrl: './trusted-store.page.scss',
  imports: [FormsModule, ErrorAlert],
})
export class TrustedStorePage {
  private readonly customersApi = inject(CustomersService);
  private toast = inject(ToastService);
  dni = '';
  storeId: number | null = null;
  saving = signal(false);
  done = signal(false);
  error = signal<string | null>(null);

  save(): void {
    if (!confirm('¿Confirmaste con el cliente? Sus otras bodegas saldrán de su portal.')) return;
    this.saving.set(true);
    this.error.set(null);
    this.done.set(false);
    this.customersApi.adminTrustStore(this.dni.trim(), Number(this.storeId)).subscribe({
      next: () => {
        this.saving.set(false);
        this.done.set(true);
        this.toast.show('Bodega de confianza actualizada.');
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }
}
