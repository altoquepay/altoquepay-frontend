import { Pipe, PipeTransform } from '@angular/core';
import { LIMA } from '../utils/lima-date';

/** "2026-11-19" -> "19/11/2026"; con hora si es datetime. */
@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
  transform(v: string | null | undefined, withTime = false): string {
    if (!v) return '—';
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, d] = v.split('-');
      return `${d}/${m}/${y}`;
    }
    const date = new Date(v);
    if (Number.isNaN(date.getTime())) return v;
    return new Intl.DateTimeFormat('es-PE', {
      timeZone: LIMA, day: '2-digit', month: '2-digit', year: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(date);
  }
}
