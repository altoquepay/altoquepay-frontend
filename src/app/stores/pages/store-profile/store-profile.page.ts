import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { parseError } from '../../../core/errors/api-error';
import { AuthService } from '../../../iam/services/auth.service';
import { BcrpCap } from '../../../regulation/model/bcrp-cap';
import { BcrpCapsService } from '../../../regulation/services/bcrp-caps.service';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { Icon } from '../../../shared/components/icon/icon';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { PctPipe } from '../../../shared/pipes/pct.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { isValidPhone, PHONE_PATTERN, phoneProblem } from '../../../shared/utils/phone';
import { Store, UpdateStoreProfile } from '../../model/store';
import { StoresService } from '../../services/stores.service';

/** Perfil del negocio: datos de la bodega, preferencias de crédito por defecto y seguridad. */
@Component({
  selector: 'app-store-profile',
  templateUrl: './store-profile.page.html',
  styleUrl: './store-profile.page.scss',
  imports: [FormsModule, RouterLink, ErrorAlert, Icon, PctPipe, FechaPipe],
})
export class StoreProfilePage implements OnInit {
  private readonly bcrpApi = inject(BcrpCapsService);
  private readonly storesApi = inject(StoresService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  store = signal<Store | null>(null);
  cap = signal<BcrpCap | null>(null);
  saving = signal<'business' | 'preferences' | null>(null);
  businessError = signal<string | null>(null);
  preferencesError = signal<string | null>(null);
  m: UpdateStoreProfile = {
    business_name: '', address: null, phone: null, default_cutoff_day: 10, default_payment_day: 15,
    default_tea: '', default_late_tea: '', default_max_weeks: 4,
  };

  readonly phonePattern = PHONE_PATTERN;
  readonly phoneProblem = phoneProblem;
  readonly cutoffDays =Array.from({ length: 25 }, (_, i) => i + 1);
  cutoff = signal(10);
  paymentDays = computed(() => Array.from({ length: 28 - this.cutoff() }, (_, i) => this.cutoff() + 1 + i));

  ngOnInit(): void {
    this.storesApi.getProfile().subscribe({
      next: (s) => this.fill(s),
      error: (e) => this.businessError.set(parseError(e).message),
    });
    this.bcrpApi.currentBcrpCap().subscribe({ next: (c) => this.cap.set(c), error: () => this.cap.set(null) });
  }

  private fill(s: Store): void {
    this.m = {
      business_name: s.business_name, address: s.address, phone: s.phone,
      default_cutoff_day: s.default_cutoff_day, default_payment_day: s.default_payment_day,
      default_tea: s.default_tea, default_late_tea: s.default_late_tea, default_max_weeks: s.default_max_weeks,
    };
    this.cutoff.set(s.default_cutoff_day);
    this.store.set(s);
  }

  setCutoff(day: number): void {
    this.m.default_cutoff_day = Number(day);
    this.cutoff.set(Number(day));
    if (this.m.default_payment_day <= this.m.default_cutoff_day) this.m.default_payment_day = this.m.default_cutoff_day + 1;
  }

  /** PUT /store/profile reemplaza todo el perfil, así que ambos botones envían ambas secciones. */
  save(section: 'business' | 'preferences'): void {
    const setError = section === 'business' ? this.businessError : this.preferencesError;
    this.businessError.set(null);
    this.preferencesError.set(null);
    if (!isValidPhone(this.m.phone)) {
      this.businessError.set(phoneProblem(this.m.phone));
      return;
    }
    if (this.m.default_payment_day <= this.m.default_cutoff_day) {
      this.preferencesError.set('El día de pago debe ser posterior al día de corte.');
      return;
    }
    const c = this.cap();
    if (c && Number(this.m.default_tea) > Number(c.max_tea)) {
      this.preferencesError.set(`La TEA supera el tope del BCRP (${c.max_tea}%).`);
      return;
    }
    if (Number(this.m.default_late_tea) <= Number(this.m.default_tea)) {
      this.preferencesError.set('La TEA moratoria debe ser mayor que la TEA.');
      return;
    }
    this.saving.set(section);
    this.storesApi
      .updateProfile({
        ...this.m,
        business_name: this.m.business_name.trim(),
        address: this.m.address?.trim() || null,
        phone: this.m.phone?.trim() || null,
        default_tea: String(this.m.default_tea),
        default_late_tea: String(this.m.default_late_tea),
      })
      .subscribe({
        next: (s) => {
          this.saving.set(null);
          this.fill(s);
          this.toast.show(section === 'business' ? 'Datos del negocio guardados.' : 'Preferencias guardadas.');
        },
        error: (e) => {
          this.saving.set(null);
          setError.set(parseError(e).message);
        },
      });
  }
}
