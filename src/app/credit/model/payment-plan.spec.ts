import { fitGrace, graceLabel, planRows, planWeeks, termOptions, toggleGraceWeek } from './payment-plan';
import { GracePeriod, Installment } from './purchase';

describe('payment plan', () => {
  it('offers a term from 1 week to the maximum of the customer', () => {
    expect(termOptions(4)).toEqual([1, 2, 3, 4]);
    expect(termOptions(0)).toEqual([1]);
  });

  it('makes any week but the last of grace, and back', () => {
    let grace = toggleGraceWeek([], 3, 5);
    grace = toggleGraceWeek(grace, 1, 5);
    expect(grace).toEqual([1, 3]);

    expect(toggleGraceWeek(grace, 3, 5)).toEqual([1]);
    expect(toggleGraceWeek(grace, 5, 5)).toEqual([1, 3]);
  });

  it('drops the grace weeks a shorter term leaves out, with its new last week', () => {
    expect(fitGrace([1, 3, 4], 4)).toEqual([1, 3]);
  });

  it('lists the weeks of the term as installments or grace', () => {
    expect(planWeeks(3, [2])).toEqual([
      { week: 1, grace: false, last: false },
      { week: 2, grace: true, last: false },
      { week: 3, grace: false, last: true },
    ]);
  });

  it.each([
    [[], 'Sin gracia'],
    [null, 'Sin gracia'],
    [[2], 'Semana 2'],
    [[1, 3], 'Semanas 1 y 3'],
    [[1, 2, 4], 'Semanas 1, 2 y 4'],
  ])('names the grace weeks %s as %s', (weeks, label) => {
    expect(graceLabel(weeks)).toBe(label);
  });

  it('puts the grace weeks between the installments by date', () => {
    const installment = (number: number, due_date: string) => ({ number, due_date }) as Installment;
    const grace = { number: 1, week: 2, end_date: '2026-10-29' } as GracePeriod;

    const rows = planRows([installment(1, '2026-10-22'), installment(2, '2026-11-05')], [grace]);

    expect(rows.map((r) => (r.grace ? `G${r.grace.number}` : `${r.installment!.number}`))).toEqual(['1', 'G1', '2']);
  });
});
