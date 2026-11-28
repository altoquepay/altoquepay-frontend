import { TestBed } from '@angular/core/testing';
import { ErrorAlert } from './error-alert';

describe('ErrorAlert', () => {
  function render(message: string | null, retryable = false) {
    TestBed.configureTestingModule({ imports: [ErrorAlert] });
    const fixture = TestBed.createComponent(ErrorAlert);
    fixture.componentRef.setInput('message', message);
    fixture.componentRef.setInput('retryable', retryable);
    fixture.detectChanges();
    return fixture;
  }

  it('shows nothing without a message', () => {
    expect(render(null).nativeElement.querySelector('.alert')).toBeNull();
  });

  it('shows the message without a retry button unless asked', () => {
    const fixture = render('No se pudo conectar.');

    expect(fixture.nativeElement.querySelector('.alert').textContent).toContain('No se pudo conectar.');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('lets the user try again', () => {
    const fixture = render('No se pudo conectar.', true);
    const retry = vi.fn();
    fixture.componentInstance.retry.subscribe(retry);

    fixture.nativeElement.querySelector('button').click();

    expect(retry).toHaveBeenCalledOnce();
  });
});
