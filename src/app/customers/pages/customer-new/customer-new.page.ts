import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { AccessCodeCard } from '../../components/access-code-card/access-code-card';
import { OpenAccount, OpenedAccount, PersonLookup } from '../../model/customer';
import { CustomersService } from '../../services/customers.service';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Store } from '../../../stores/model/store';
import { StoresService } from '../../../stores/services/stores.service';

/** Alta de cliente: lookup por DNI → abrir cuenta → mostrar código de acceso. */
@Component({
  selector: 'app-customer-new',
  templateUrl: './customer-new.page.html',
  styleUrl: './customer-new.page.scss',
  imports: [FormsModule, RouterLink, ErrorAlert, AccessCodeCard],
})
export class CustomerNewPage implements OnInit {
  private readonly customersApi = inject(CustomersService);
  private readonly storesApi = inject(StoresService);
  dni = '';
  store = signal<Store | null>(null);
  person = signal<PersonLookup | null>(null);
  lookupDone = signal(false);
  looking = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  opened = signal<OpenedAccount | null>(null);
  m = this.empty();

  ngOnInit(): void {
    this.storesApi.getProfile().subscribe({ next: (s) => this.store.set(s), error: () => {} });
  }

  validDni(): boolean {
    return /^\d{8}$/.test(this.dni.trim());
  }

  lookup(): void {
    this.looking.set(true);
    this.lookupDone.set(false);
    this.error.set(null);
    this.customersApi.lookupPerson(this.dni.trim()).subscribe({
      next: (p) => {
        this.person.set(p);
        this.looking.set(false);
        this.lookupDone.set(true);
      },
      error: (e: unknown) => {
        this.looking.set(false);
        if (e instanceof HttpErrorResponse && e.status === 404) {
          this.person.set(null);
          this.lookupDone.set(true);
        } else {
          this.error.set(parseError(e).message);
        }
      },
    });
  }

  submit(): void {
    if (this.m.cutoff_day && this.m.payment_day && this.m.payment_day <= this.m.cutoff_day) {
      this.error.set('El día de pago debe ser posterior al día de corte.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const body: OpenAccount = {
      dni: this.dni.trim(),
      first_names: this.m.first_names.trim(),
      last_names: this.m.last_names.trim(),
      phone: this.m.phone?.trim() || null,
      address: this.m.address?.trim() || null,
      credit_limit: String(this.m.credit_limit),
      cutoff_day: this.m.cutoff_day || null,
      payment_day: this.m.payment_day || null,
      tea: this.m.tea ? String(this.m.tea) : null,
      late_tea: this.m.late_tea ? String(this.m.late_tea) : null,
      max_weeks: this.m.max_weeks || null,
    };
    this.customersApi.openAccount(body).subscribe({
      next: (o) => {
        this.saving.set(false);
        this.opened.set(o);
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }

  reset(): void {
    this.dni = '';
    this.person.set(null);
    this.lookupDone.set(false);
    this.opened.set(null);
    this.m = this.empty();
  }

  private empty() {
    return {
      first_names: '', last_names: '', phone: '' as string | null, address: '' as string | null,
      credit_limit: '', cutoff_day: null as number | null, payment_day: null as number | null,
      tea: '', late_tea: '', max_weeks: null as number | null,
    };
  }
}
