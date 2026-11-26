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
});
