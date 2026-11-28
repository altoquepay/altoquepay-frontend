import { Component, input, model } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

/** One filter: what it sends, what it says and, once known, how many results it leaves. */
export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
  count?: number | null;
  tone?: 'bad' | 'warn' | 'ok';
}

/**
 * Counts what each filter leaves, asking only for the specific ones: the "all" filter (value '')
 * is their sum, so the filters must cover every case. Fewer requests at once keep the page quick.
 */
export function countEach<T extends string>(
  options: FilterOption<T>[],
  count: (value: T) => Observable<number>,
): Observable<Partial<Record<T, number>>> {
  const specific = options.filter((o) => o.value !== '');
  return forkJoin(specific.map((o) => count(o.value))).pipe(
    map((totals) => {
      const counts: Partial<Record<T, number>> = {};
      specific.forEach((o, i) => (counts[o.value] = totals[i]));
      if (options.some((o) => o.value === '')) counts['' as T] = totals.reduce((sum, n) => sum + n, 0);
      return counts;
    }),
  );
}

/** Filters shown as chips: one is pressed, and each tells how many results it would leave. */
@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.html',
  styleUrl: './filter-chips.scss',
})
export class FilterChips<T extends string = string> {
  options = input.required<FilterOption<T>[]>();
  value = model.required<T>();
  label = input('Filtrar');

  pick(option: FilterOption<T>): void {
    if (option.value !== this.value()) this.value.set(option.value);
  }
}
