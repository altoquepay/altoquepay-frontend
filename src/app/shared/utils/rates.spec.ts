import { lateTeaProblem } from './rates';

describe('late rate rule', () => {
  it('accepts a late rate above the TEA, with no upper limit', () => {
    expect(lateTeaProblem('40', '60')).toBeNull();
    expect(lateTeaProblem(75, 150)).toBeNull();
  });

  it.each([
    ['40', '40'],
    ['40', '15'],
    ['75.5', '75.4999999'],
  ])('rejects a late rate of %s%% that is not above a TEA of %s%%', (tea, lateTea) => {
    expect(lateTeaProblem(tea, lateTea)).toBe('La TEA moratoria debe ser mayor que la TEA.');
  });

  it('leaves the check to the server while a rate is missing', () => {
    expect(lateTeaProblem('', '60')).toBeNull();
    expect(lateTeaProblem('40', null)).toBeNull();
    expect(lateTeaProblem(undefined, undefined)).toBeNull();
  });
});
