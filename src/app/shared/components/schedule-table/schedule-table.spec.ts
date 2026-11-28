import { TestBed } from '@angular/core/testing';
import { GracePeriod, Installment } from '../../../credit/model/purchase';
import { ScheduleTable } from './schedule-table';

describe('ScheduleTable', () => {
  const installment = (number: number, due: string, opening: string): Installment => ({
    id: number,
    number,
    due_date: due,
    opening_balance: opening,
    interest: '1.11',
    amortization: '33.33',
    amount: '34.44',
    closing_balance: '67.76',
    status: 'PENDING',
  });
  const grace: GracePeriod = {
    number: 1,
    week: 1,
    end_date: '2026-12-04',
    opening_balance: '100.00',
    interest: '1.09',
    closing_balance: '101.09',
  };

  function render(items: Installment[], gracePeriods: GracePeriod[] = [], showStatus = true) {
    TestBed.configureTestingModule({ imports: [ScheduleTable] });
    const fixture = TestBed.createComponent(ScheduleTable);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('grace', gracePeriods);
    fixture.componentRef.setInput('showStatus', showStatus);
    fixture.detectChanges();
    const rows = [...fixture.nativeElement.querySelectorAll('tbody tr')] as HTMLTableRowElement[];
    return rows.map((row) => [...row.querySelectorAll('td')].map((cell) => cell.textContent!.trim()));
  }

  it('lists the grace weeks first, with nothing paid and their interest added', () => {
    const rows = render([installment(1, '2026-12-11', '101.09')], [grace]);

    expect(rows[0][0]).toBe('G1');
    expect(rows[0][1]).toBe('04/12/2026');
    expect(rows[0].slice(2, 7).map((cell) => cell.replace(/\s/g, ' '))).toEqual([
      'S/ 100.00',
      'S/ 1.09',
      'S/ 0.00',
      'S/ 0.00',
      'S/ 101.09',
    ]);
    expect(rows[0][7]).toBe('Gracia');
    expect(rows[1][0]).toBe('1');
  });

  it('puts a grace week chosen between installments in its place by date', () => {
    const between: GracePeriod = { ...grace, week: 2, end_date: '2026-12-11' };
    const rows = render([installment(1, '2026-12-04', '100.00'), installment(2, '2026-12-18', '68.85')], [between]);

    expect(rows.map((row) => row[0])).toEqual(['1', 'G1', '2']);
  });

  it('shows only the installments without grace, and hides the status when asked', () => {
    const rows = render([installment(1, '2026-12-04', '100.00')], [], false);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveLength(7);
    expect(rows[0][0]).toBe('1');
  });

  it('explains that a single date purchase has no installments', () => {
    expect(render([])).toEqual([['Sin cuotas (compra de fecha única).']]);
  });
});
