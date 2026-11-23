/**
 * Teléfono peruano obligatorio, en una de dos formas (los espacios son opcionales):
 * - los 9 dígitos del celular: 987654321, 987 654 321
 * - +51 y los 9 dígitos: +51987654321, +51 987 654 321
 * Sirve tal cual para el atributo `pattern` de un input, junto con `required`.
 */
export const PHONE_PATTERN = '^(?:\\+51\\s?)?\\d(?:\\s?\\d){8}$';

const PHONE_REGEX = new RegExp(PHONE_PATTERN);

/** `true` si el teléfono tiene 9 dígitos, o +51 y 9 dígitos. */
export function isValidPhone(value: string | null | undefined): boolean {
  return PHONE_REGEX.test(value?.trim() ?? '');
}

/** Mensaje para mostrar bajo el campo, o `null` si el teléfono es válido. */
export function phoneProblem(value: string | null | undefined): string | null {
  const v = value?.trim() ?? '';
  if (!v) return 'El teléfono es obligatorio.';
  if (isValidPhone(v)) return null;
  if (!/^\+?[\d\s]*$/.test(v)) return 'Solo se aceptan números.';
  return 'Ingresa los 9 dígitos del celular, o +51 y los 9 dígitos.';
}
