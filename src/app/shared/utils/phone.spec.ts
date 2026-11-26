import { isValidPhone, phoneProblem } from './phone';

describe('isValidPhone', () => {
  it('accepts 9 digits, with or without spaces', () => {
    for (const phone of ['987654321', '987 654 321', ' 987654321 ']) {
      expect(isValidPhone(phone)).toBe(true);
    }
  });

  it('accepts +51 followed by 9 digits, with or without spaces', () => {
    for (const phone of ['+51987654321', '+51 987654321', '+51 987 654 321']) {
      expect(isValidPhone(phone)).toBe(true);
    }
  });

  it('rejects an empty phone, since it is required', () => {
    expect(isValidPhone(null)).toBe(false);
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('   ')).toBe(false);
  });

  it('rejects the wrong length or another prefix', () => {
    for (const phone of ['98765432', '9876543210', '51987654321', '+5198765432', '+52987654321', '+987654321']) {
      expect(isValidPhone(phone)).toBe(false);
    }
  });
});

describe('phoneProblem', () => {
  it('asks for the phone when it is empty', () => {
    expect(phoneProblem('')).toBe('El teléfono es obligatorio.');
    expect(phoneProblem(null)).toBe('El teléfono es obligatorio.');
  });

  it('says only numbers are accepted when there are letters or symbols', () => {
    expect(phoneProblem('abcdefgh')).toBe('Solo se aceptan números.');
    expect(phoneProblem('98765abc1')).toBe('Solo se aceptan números.');
    expect(phoneProblem('987-654-321')).toBe('Solo se aceptan números.');
  });

  it('explains both accepted forms when only the digits are wrong', () => {
    expect(phoneProblem('98765432')).toBe('Ingresa los 9 dígitos del celular, o +51 y los 9 dígitos.');
  });

  it('returns null for a valid phone', () => {
    expect(phoneProblem('987654321')).toBeNull();
    expect(phoneProblem('+51 987 654 321')).toBeNull();
  });
});
