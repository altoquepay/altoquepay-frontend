import { GracePeriod, Installment } from './purchase';

/**
 * Reglas del plan semanal: el plazo (cuotas + semanas de gracia total) cabe en las semanas máximas
 * del cliente. Cualquier semana menos la última puede ser de gracia: al inicio, entre cuotas o
 * ninguna. En ella no se paga y su interés se suma al saldo, así que las cuotas que siguen suben.
 */

/** Plazos que se pueden elegir: de 1 a las semanas máximas del cliente. */
export function termOptions(maxWeeks: number): number[] {
  return range(1, Math.max(1, maxWeeks));
}

/** Vuelve de gracia una semana, o la vuelve cuota otra vez. La última siempre paga la última cuota. */
export function toggleGraceWeek(grace: number[], week: number, term: number): number[] {
  if (week < 1 || week >= term) return grace;
  const next = grace.includes(week) ? grace.filter((w) => w !== week) : [...grace, week];
  return next.sort((a, b) => a - b);
}

/** Quita las semanas de gracia que ya no caben en el plazo (la última es siempre una cuota). */
export function fitGrace(grace: number[], term: number): number[] {
  return grace.filter((w) => w < term);
}

export interface PlanWeek {
  week: number;
  grace: boolean;
  /** La última semana no puede ser de gracia. */
  last: boolean;
}

/** Las semanas del plazo, cada una marcada como cuota o gracia. */
export function planWeeks(term: number, grace: number[]): PlanWeek[] {
  return range(1, term).map((week) => ({ week, grace: grace.includes(week), last: week === term }));
}

/** "Sin gracia", "Semana 2", "Semanas 1 y 3" o "Semanas 1, 2 y 4". */
export function graceLabel(weeks: number[] | null | undefined): string {
  if (!weeks?.length) return 'Sin gracia';
  if (weeks.length === 1) return `Semana ${weeks[0]}`;
  return `Semanas ${weeks.slice(0, -1).join(', ')} y ${weeks[weeks.length - 1]}`;
}

/** Una fila del plan de pagos: una semana de gracia o una cuota. */
export interface PlanRow {
  date: string;
  grace?: GracePeriod;
  installment?: Installment;
}

/** Junta las semanas de gracia y las cuotas en el orden en que vencen. */
export function planRows(installments: Installment[], grace: GracePeriod[] = []): PlanRow[] {
  const rows: PlanRow[] = [
    ...grace.map((g) => ({ date: g.end_date, grace: g })),
    ...installments.map((i) => ({ date: i.due_date, installment: i })),
  ];
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

function range(from: number, to: number): number[] {
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
}
