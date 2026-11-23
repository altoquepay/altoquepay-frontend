import { Component, computed, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

/** Paginador para respuestas Page<T>: "Mostrando 5 de 24 clientes" y números de página. */
@Component({
  selector: 'app-pager',
  imports: [Icon],
  templateUrl: './pager.html',
  styleUrl: './pager.scss',
})
export class Pager {
  page = input.required<number>();
  size = input.required<number>();
  total = input.required<number>();
  noun = input('registros');
  pageChange = output<number>();
  pages = computed(() => Math.max(1, Math.ceil(this.total() / this.size())));
  shown = computed(() => Math.max(0, Math.min(this.size(), this.total() - (this.page() - 1) * this.size())));
  /** Hasta 5 números alrededor de la página actual. */
  numbers = computed(() => {
    const last = this.pages();
    const start = Math.max(1, Math.min(this.page() - 2, last - 4));
    const end = Math.min(last, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });
}
