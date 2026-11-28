import { firstValueFrom, of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { countEach, FilterChips, FilterOption } from './filter-chips';

describe('FilterChips', () => {
  const options: FilterOption[] = [
    { value: 'PENDING', label: 'Pendientes', count: 4 },
    { value: 'OVERDUE', label: 'Vencidas', count: 1, tone: 'bad' },
    { value: '', label: 'Todas' },
  ];

  function render(value = 'PENDING') {
    TestBed.configureTestingModule({ imports: [FilterChips] });
    const fixture = TestBed.createComponent(FilterChips);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();
    const chips = () => [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[];
    return { fixture, chips };
  }

  it('shows each filter with how many results it leaves, and presses the chosen one', () => {
    const { chips } = render();

    expect(chips().map((c) => c.textContent!.replace(/\s+/g, ' ').trim())).toEqual(['Pendientes 4', 'Vencidas 1', 'Todas']);
    expect(chips().map((c) => c.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);
    expect(chips()[1].classList).toContain('tone-bad');
  });

  it('changes the value when another chip is clicked', () => {
    const { fixture, chips } = render();
    const seen: string[] = [];
    fixture.componentInstance.value.subscribe((v) => seen.push(v));

    chips()[1].click();
    fixture.detectChanges();

    expect(seen).toEqual(['OVERDUE']);
    expect(chips()[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('does nothing when the chip already pressed is clicked again', () => {
    const { fixture, chips } = render();
    const seen: string[] = [];
    fixture.componentInstance.value.subscribe((v) => seen.push(v));

    chips()[0].click();

    expect(seen).toEqual([]);
  });
});

describe('countEach', () => {
  it('asks only for the specific filters and adds them up for "all"', async () => {
    const asked: string[] = [];
    const options: FilterOption[] = [
      { value: '', label: 'Todos' },
      { value: 'ACTIVE', label: 'Activos' },
      { value: 'INACTIVE', label: 'Inactivos' },
    ];

    const counts = await firstValueFrom(
      countEach(options, (value) => {
        asked.push(value);
        return of(value === 'ACTIVE' ? 4 : 1);
      }),
    );

    expect(asked).toEqual(['ACTIVE', 'INACTIVE']);
    expect(counts).toEqual({ ACTIVE: 4, INACTIVE: 1, '': 5 });
  });
});
