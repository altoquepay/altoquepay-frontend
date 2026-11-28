import { TestBed } from '@angular/core/testing';
import { SearchBox } from './search-box';

describe('SearchBox', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function render() {
    TestBed.configureTestingModule({ imports: [SearchBox] });
    const fixture = TestBed.createComponent(SearchBox);
    const searched: string[] = [];
    fixture.componentInstance.search.subscribe((text) => searched.push(text));
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const typeText = (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    return { fixture, input, typeText, searched };
  }

  it('searches once the user stops typing, with the text trimmed', () => {
    const { typeText, searched } = render();

    typeText('ro');
    typeText('rosa ');
    vi.advanceTimersByTime(349);
    expect(searched).toEqual([]);
    vi.advanceTimersByTime(1);

    expect(searched).toEqual(['rosa']);
  });

  it('searches at once on Enter', () => {
    const { input, typeText, searched } = render();

    typeText('arroz');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    vi.advanceTimersByTime(1000);

    expect(searched).toEqual(['arroz']);
  });

  it('shows the × only with text, and clearing it searches everything again', () => {
    const { fixture, typeText, searched } = render();
    const clear = () => fixture.nativeElement.querySelector('button.clear') as HTMLButtonElement | null;
    expect(clear()).toBeNull();

    typeText('gas');
    clear()!.click();
    fixture.detectChanges();
    vi.advanceTimersByTime(1000);

    expect(searched).toEqual(['']);
    expect(fixture.componentInstance.value()).toBe('');
    expect(clear()).toBeNull();
  });
});
