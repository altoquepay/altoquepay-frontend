import { Pipe, PipeTransform } from '@angular/core';

/** 40 -> "40%" (las tasas vienen como porcentaje en texto). */
@Pipe({ name: 'pct' })
export class PctPipe implements PipeTransform {
  transform(v: string | number | null | undefined, digits = 2): string {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return n.toLocaleString('es-PE', { maximumFractionDigits: digits }) + '%';
  }
}
