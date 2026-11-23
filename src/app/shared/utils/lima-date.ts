/** Fechas en la hora de negocio (Lima, UTC-5, sin horario de verano). */
export const LIMA = 'America/Lima';

/** Fecha de hoy en Lima, YYYY-MM-DD. */
export function todayLima(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: LIMA }).format(new Date());
}

/** Fecha y hora actual en Lima para un <input type="datetime-local"> (YYYY-MM-DDTHH:mm). */
export function nowLimaLocal(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: LIMA, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/** Convierte un valor de datetime-local (hora de Lima) a ISO 8601 con zona -05:00. Lima no tiene horario de verano. */
export function limaLocalToIso(local: string): string {
  return `${local.length === 16 ? local + ':00' : local}-05:00`;
}

export function firstDayOfMonthLima(): string {
  return todayLima().slice(0, 8) + '01';
}

export function currentYearMonthLima(): { year: number; month: number } {
  const t = todayLima();
  return { year: Number(t.slice(0, 4)), month: Number(t.slice(5, 7)) };
}

export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/** "Hoy, 16 de agosto de 2026" en la hora de Lima. */
export function todayLongLima(): string {
  const text = new Intl.DateTimeFormat('es-PE', { timeZone: LIMA, day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  return `Hoy, ${text}`;
}

/** Días entre hoy (Lima) y una fecha YYYY-MM-DD; negativo si ya pasó. */
export function daysFromToday(date: string): number {
  const [y, m, d] = todayLima().split('-').map(Number);
  const [y2, m2, d2] = date.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y, m - 1, d)) / 86_400_000);
}
