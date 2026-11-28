import { fitInstallments, graceLabel, graceOptions, installmentOptions } from './payment-plan';

describe('payment plan', () => {
  it('offers installments that fit the weeks left by the grace', () => {
    expect(installmentOptions(4, 0)).toEqual([1, 2, 3, 4]);
    expect(installmentOptions(4, 1)).toEqual([1, 2, 3]);
    expect(installmentOptions(4, 3)).toEqual([1]);
  });

  it('always leaves at least one installment', () => {
    expect(installmentOptions(1, 0)).toEqual([1]);
    expect(graceOptions(1)).toEqual([0]);
  });

  it('offers no grace up to one week less than the maximum', () => {
    expect(graceOptions(4)).toEqual([0, 1, 2, 3]);
  });

  it.each([
    // installments, grace, max → installments that keep the term within the maximum
    [4, 1, 4, 3],
    [4, 3, 4, 1],
    [2, 1, 4, 2],
    [3, 0, 4, 3],
  ])('fits %i installments with %i grace weeks in %i weeks as %i', (count, grace, max, fitted) => {
    expect(fitInstallments(count, grace, max)).toBe(fitted);
  });

  it.each([
    [0, 'Sin gracia'],
    [null, 'Sin gracia'],
    [1, '1 semana'],
    [3, '3 semanas'],
  ])('names %s grace weeks as %s', (weeks, label) => {
    expect(graceLabel(weeks)).toBe(label);
  });
});
