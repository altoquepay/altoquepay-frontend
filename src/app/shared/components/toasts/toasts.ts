import { Component, inject } from '@angular/core';
import { Badge } from '../badge/badge';
import { ErrorAlert } from '../error-alert/error-alert';
import { Pager } from '../pager/pager';
import { ToastService } from '../../services/toast.service';

/** Contenedor de toasts. */
@Component({
  selector: 'app-toasts',
  templateUrl: './toasts.html',
  styleUrl: './toasts.scss',
})
export class Toasts {
  toast = inject(ToastService);
}

export const UI = [Pager, Badge, ErrorAlert] as const;
