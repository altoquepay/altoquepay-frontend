import { Pipe, PipeTransform } from '@angular/core';
import { LABELS } from '../utils/labels';

/** Etiqueta de un enum. */
@Pipe({ name: 'label' })
export class LabelPipe implements PipeTransform {
  transform(v: string | null | undefined): string {
    return v ? LABELS[v] ?? v : '—';
  }
}
