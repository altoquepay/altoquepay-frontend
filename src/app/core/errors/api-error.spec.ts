import { HttpErrorResponse } from '@angular/common/http';
import { parseError } from './api-error';

describe('parseError', () => {
  it('maps a business code to a Spanish message', () => {
    const err = new HttpErrorResponse({
      status: 422,
      error: { code: 'CREDIT_LIMIT_EXCEEDED', message: 'The purchase exceeds the available credit (S/ 120.00).', field: null, details: null },
    });
    const parsed = parseError(err);
    expect(parsed.code).toBe('CREDIT_LIMIT_EXCEEDED');
    expect(parsed.message).toContain('crédito disponible');
    expect(parsed.message).toContain('S/ 120.00');
  });

  it('treats a response without body as a connection error', () => {
    const parsed = parseError(new HttpErrorResponse({ status: 0 }));
    expect(parsed.code).toBe('NETWORK');
  });

  it('names the payment day when its range is wrong', () => {
    const err = new HttpErrorResponse({
      status: 422,
      error: { code: 'INVALID_DAY_RANGE', message: 'The payment day must be between 1 and 28.', field: 'payment_day', details: null },
    });
    expect(parseError(err).message).toBe('El día de pago debe estar entre 1 y 28.');
  });

  it('keeps the cutoff day message for the cutoff day', () => {
    const err = new HttpErrorResponse({
      status: 422,
      error: { code: 'INVALID_DAY_RANGE', message: 'The cutoff day must be between 1 and 25.', field: 'cutoff_day', details: null },
    });
    expect(parseError(err).message).toBe('El día de corte debe estar entre 1 y 25.');
  });

  function validationError(field: string): HttpErrorResponse {
    return new HttpErrorResponse({
      status: 422,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input should be a valid decimal',
        field,
        details: { errors: [{ field, message: 'Input should be a valid decimal' }] },
      },
    });
  }

  it('shows a validation error in Spanish with the field label', () => {
    expect(parseError(validationError('credit_limit')).message).toBe('Revisa el campo "límite de crédito".');
  });

  it('labels a nested field by its last part', () => {
    expect(parseError(validationError('items.0.quantity')).message).toBe('Revisa el campo "cantidad".');
  });

  it('falls back to the generic message for an unknown field', () => {
    expect(parseError(validationError('foo')).message).toBe('Revisa los datos del formulario.');
  });
});
