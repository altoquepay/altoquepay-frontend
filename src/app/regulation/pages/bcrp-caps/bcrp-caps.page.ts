import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { parseError } from '../../../core/errors/api-error';
import { BcrpCap, RegisterBcrpCap } from '../../model/bcrp-cap';
import { BcrpCapsService } from '../../services/bcrp-caps.service';
import { ErrorAlert } from '../../../shared/components/error-alert/error-alert';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { PctPipe } from '../../../shared/pipes/pct.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { todayLima } from '../../../shared/utils/lima-date';

@Component({
  selector: 'app-admin-bcrp',
  templateUrl: './bcrp-caps.page.html',
  styleUrl: './bcrp-caps.page.scss',
  imports: [FormsModule, ErrorAlert, PctPipe, FechaPipe],
})
export class BcrpCapsPage implements OnInit {
  private readonly bcrpApi = inject(BcrpCapsService);
  private toast = inject(ToastService);
  caps = signal<BcrpCap[]>([]);
  current = signal<BcrpCap | null>(null);
  currentLoaded = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  m: RegisterBcrpCap = { max_tea: '', valid_from: todayLima(), valid_to: '' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.bcrpApi.listBcrpCaps().subscribe({ next: (c) => this.caps.set(c), error: (e) => this.error.set(parseError(e).message) });
    this.bcrpApi.currentBcrpCap().subscribe({
      next: (c) => {
        this.current.set(c);
        this.currentLoaded.set(true);
      },
      error: () => {
        this.current.set(null);
        this.currentLoaded.set(true);
      },
    });
  }

  save(): void {
    if (this.m.valid_to < this.m.valid_from) {
      this.error.set('El período debe terminar el mismo día o después de su inicio.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.bcrpApi.registerBcrpCap({ ...this.m, max_tea: String(this.m.max_tea) }).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show('Tope registrado.');
        this.m = { max_tea: '', valid_from: todayLima(), valid_to: '' };
        this.load();
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(parseError(e).message);
      },
    });
  }
}
