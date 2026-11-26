import { Pipe, PipeTransform } from '@angular/core';
import { MONTHS } from '../utils/lima-date';

@Pipe({ name: 'mes' })
export class MesPipe implements PipeTransform {
  transform(month: number, year?: number): string {
    const name = MONTHS[month - 1] ?? String(month);
    return year ? `${name} ${year}` : name;
  }
}
