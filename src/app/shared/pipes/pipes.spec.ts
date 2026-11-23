import { FechaPipe } from './fecha.pipe';
import { PctPipe } from './pct.pipe';
import { SolesPipe } from './soles.pipe';

describe('format pipes', () => {
  it('formats soles from the API text with 2 decimals', () => {
    const value = new SolesPipe().transform('1234.5');
    expect(value.startsWith('S/ ')).toBe(true);
    expect(value).toContain('234');
    expect(new SolesPipe().transform(null)).toBe('—');
  });

  it('formats a rate written as a percentage', () => {
    expect(new PctPipe().transform('40')).toBe('40%');
  });

  it('formats an ISO date as dd/mm/yyyy', () => {
    expect(new FechaPipe().transform('2026-11-19')).toBe('19/11/2026');
  });
});
