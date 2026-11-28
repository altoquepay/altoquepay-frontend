import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';

@Component({
  imports: [EmptyState],
  template: `
    <app-empty-state id="none" title="Aún no tienes productos" message="Registra los que vendes.">
      <a href="/new">Nuevo producto</a>
    </app-empty-state>
    <app-empty-state id="good" tone="positive" title="No hay cuotas vencidas" />
  `,
})
class Host {}

describe('EmptyState', () => {
  function render() {
    TestBed.configureTestingModule({ imports: [Host] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return (id: string) => fixture.nativeElement.querySelector(`#${id} .empty`) as HTMLElement;
  }

  it('says why the list is empty and offers the next step', () => {
    const none = render()('none');

    expect(none.querySelector('strong')!.textContent).toBe('Aún no tienes productos');
    expect(none.querySelector('p')!.textContent).toBe('Registra los que vendes.');
    expect(none.querySelector('a')!.textContent).toBe('Nuevo producto');
    expect(none.classList).not.toContain('positive');
  });

  it('tells good news without a message nor an action', () => {
    const good = render()('good');

    expect(good.classList).toContain('positive');
    expect(good.querySelector('p')).toBeNull();
  });
});
