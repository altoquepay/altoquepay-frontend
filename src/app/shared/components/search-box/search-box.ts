import { Component, input, model, OnDestroy, output } from '@angular/core';
import { Icon } from '../icon/icon';

/** Search field that searches while typing (after a short pause) and can be cleared with ×. */
@Component({
  selector: 'app-search-box',
  imports: [Icon],
  templateUrl: './search-box.html',
  styleUrl: './search-box.scss',
})
export class SearchBox implements OnDestroy {
  value = model('');
  placeholder = input('Buscar…');
  label = input('Buscar');
  delay = input(350);
  /** The text to search, trimmed: once the user stops typing, presses Enter or clears it. */
  search = output<string>();
  private timer: ReturnType<typeof setTimeout> | undefined;

  type(text: string): void {
    this.value.set(text);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.search.emit(text.trim()), this.delay());
  }

  now(): void {
    clearTimeout(this.timer);
    this.search.emit(this.value().trim());
  }

  clear(): void {
    this.value.set('');
    this.now();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
