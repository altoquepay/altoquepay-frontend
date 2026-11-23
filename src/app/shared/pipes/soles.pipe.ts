import { Pipe, PipeTransform } from '@angular/core';

/** S/ 1,234.50 a partir del texto con 2 decimales que manda la API. */
@Pipe({ name: 'soles' })
export class SolesPipe implements PipeTransform {
  transform(v: string | number | null | undefined): string {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
