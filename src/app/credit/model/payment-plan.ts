/**
 * Reglas del plan semanal: cuotas + semanas de gracia total caben en las semanas máximas del
 * cliente, y siempre queda al menos una cuota. Durante la gracia no se paga y el interés se suma
 * al saldo, así que con el plazo fijo la gracia sube las cuotas que siguen.
 */

/** Números de cuotas que se pueden elegir con esa gracia: de 1 a lo que dejan las semanas. */
export function installmentOptions(maxWeeks: number, graceWeeks: number): number[] {
  return range(1, Math.max(1, maxWeeks - graceWeeks));
}

/** Semanas de gracia que se pueden elegir: de 0 (sin gracia) a una menos que el máximo. */
export function graceOptions(maxWeeks: number): number[] {
  return range(0, Math.max(0, maxWeeks - 1));
}

/** Ajusta las cuotas para que, con esa gracia, el plazo siga cabiendo en las semanas máximas. */
export function fitInstallments(installments: number, graceWeeks: number, maxWeeks: number): number {
  return Math.max(1, Math.min(installments, maxWeeks - graceWeeks));
}

/** "Sin gracia", "1 semana" o "N semanas". */
export function graceLabel(weeks: number | null | undefined): string {
  if (!weeks) return 'Sin gracia';
  return weeks === 1 ? '1 semana' : `${weeks} semanas`;
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
