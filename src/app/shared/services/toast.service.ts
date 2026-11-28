import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
  kind: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  /** Un aviso igual que ya está en pantalla no se repite (p. ej. varias peticiones con 401 a la vez). */
  show(text: string, kind: Toast['kind'] = 'success', ms = 4500): void {
    if (this.toasts().some((t) => t.text === text && t.kind === kind)) return;
    const id = ++this.seq;
    this.toasts.update((t) => [...t, { id, text, kind }]);
    setTimeout(() => this.dismiss(id), ms);
  }

  dismiss(id: number): void {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
