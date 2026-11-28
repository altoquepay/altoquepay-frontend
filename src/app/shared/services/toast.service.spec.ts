import { ToastService } from './toast.service';

describe('ToastService', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows a toast and hides it after its time', () => {
    const toasts = new ToastService();

    toasts.show('Compra registrada.', 'success', 1000);

    expect(toasts.toasts().map((t) => t.text)).toEqual(['Compra registrada.']);
    vi.advanceTimersByTime(1000);
    expect(toasts.toasts()).toEqual([]);
  });

  it('does not repeat a toast that is already on screen', () => {
    const toasts = new ToastService();

    // Several requests answered 401 at once used to stack the same message three times.
    toasts.show('Tu sesión venció. Vuelve a iniciar sesión.', 'error');
    toasts.show('Tu sesión venció. Vuelve a iniciar sesión.', 'error');
    toasts.show('Tu sesión venció. Vuelve a iniciar sesión.', 'error');

    expect(toasts.toasts()).toHaveLength(1);
  });

  it('shows the same text again once the first one is gone, and different ones together', () => {
    const toasts = new ToastService();

    toasts.show('Guardado.', 'success', 500);
    toasts.show('Guardado.', 'info', 500);
    vi.advanceTimersByTime(500);
    toasts.show('Guardado.', 'success', 500);

    expect(toasts.toasts().map((t) => t.kind)).toEqual(['success']);
  });
});
