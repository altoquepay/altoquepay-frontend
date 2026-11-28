import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * What a list shows when it has nothing: why, and what to do next (an action can be projected).
 * The positive tone is for good news, like nothing overdue.
 */
@Component({
  selector: 'app-empty-state',
  imports: [Icon],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  icon = input('box');
  title = input.required<string>();
  message = input<string | null>(null);
  tone = input<'neutral' | 'positive'>('neutral');
}
