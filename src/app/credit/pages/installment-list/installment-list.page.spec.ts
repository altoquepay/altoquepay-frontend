import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PurchasesService } from '../../services/purchases.service';
import { InstallmentListPage } from './installment-list.page';

describe('InstallmentListPage', () => {
  const totals: Record<string, number> = { PENDING: 3, OVERDUE: 0, PAID: 5, CANCELLED: 0, '': 99 };

  function render(query: Record<string, string> = {}, fail = false) {
    const listInstallments = vi.fn((q: { size: number; status: string; due_before?: string }) =>
      fail && q.size === 20
        ? throwError(() => ({ status: 0 }))
        : of({ items: [], page: 1, size: q.size, total: totals[q.status] }),
    );
    TestBed.configureTestingModule({
      imports: [InstallmentListPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } },
        { provide: PurchasesService, useValue: { listInstallments } },
      ],
    });
    const fixture = TestBed.createComponent(InstallmentListPage);
    fixture.detectChanges();
    const text = () => (fixture.nativeElement as HTMLElement).textContent!.replace(/\s+/g, ' ');
    return { fixture, page: fixture.componentInstance, listInstallments, text };
  }

  it('counts the installments of each status on its chip', () => {
    const { page } = render();

    expect(page.options().map((o) => `${o.label} ${o.count}`)).toEqual([
      'Pendientes 3', 'Vencidas 0', 'Pagadas 5', 'Canceladas 0', 'Todas 8',
    ]);
  });

  it('opens on the status of the link and tells good news when nothing is overdue', () => {
    const { page, text } = render({ status: 'OVERDUE' });

    expect(page.status()).toBe('OVERDUE');
    expect(text()).toContain('No hay cuotas vencidas');
  });

  it('counts again for the chosen date and offers to remove it when nothing is left', () => {
    const { fixture, page, listInstallments, text } = render();
    listInstallments.mockClear();

    page.setDueBefore('2026-12-01');
    fixture.detectChanges();

    expect(listInstallments).toHaveBeenCalledTimes(5);
    expect(listInstallments.mock.calls.every(([q]) => q.due_before === '2026-12-01')).toBe(true);
    expect(text()).toContain('Quitar la fecha');
  });

  it('offers to try again when the list fails', () => {
    const { fixture, text } = render({}, true);

    expect(text()).toContain('Reintentar');
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });
});
