import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { ApiErrorBody } from '../../shared/models/page';

/** Mensajes en español para cada `code` estable del backend (sección 4 de la guía). */
const MESSAGES: Record<string, string> = {
  // Generales
  UNAUTHORIZED: 'Tu sesión venció. Vuelve a iniciar sesión.',
  FORBIDDEN: 'No tienes permiso para hacer esto.',
  NOT_FOUND: 'No se encontró lo que buscas.',
  METHOD_NOT_ALLOWED: 'Operación no permitida.',
  CONTENT_TOO_LARGE: 'El archivo o los datos pesan más de 3 MB.',
  VALIDATION_ERROR: 'Revisa los datos del formulario.',
  TOO_MANY_ATTEMPTS: 'Demasiados intentos desde esta conexión. Espera 15 minutos e inténtalo otra vez.',
  INTERNAL_ERROR: 'Error de conexión con el servidor.',
  // Negocio
  ACCOUNT_INACTIVE: 'Este cliente ya no puede comprar al crédito.',
  ALREADY_PAID: 'Ya fue pagado.',
  BCRP_CAP_OVERLAP: 'El período se cruza con el de otro tope del BCRP.',
  CREDIT_LIMIT_EXCEEDED: 'La compra supera el crédito disponible del cliente.',
  CUSTOMER_ALREADY_IN_STORE: 'Esta persona ya tiene una cuenta en la bodega.',
  CYCLE_CLOSED: 'El ciclo ya está cerrado.',
  CYCLE_NOT_CLOSED: 'El ciclo sigue abierto. Paga sus compras por adelantado con "Fecha única anticipada".',
  DUPLICATE_PRODUCT: 'Cada producto va en un solo ítem.',
  EMAIL_TAKEN: 'El email ya está registrado.',
  IMAGE_TOO_LARGE: 'La imagen debe pesar como máximo 2 MB.',
  INSTALLMENT_OUT_OF_ORDER: 'Primero hay que pagar una cuota anterior de esta compra.',
  INVALID_ACCESS_CODE: 'El código de acceso no es válido o ya venció. Pide uno nuevo a la bodega.',
  INVALID_AMOUNT: 'El monto debe ser un número no negativo dentro del rango permitido.',
  INVALID_BUSINESS_NAME: 'El nombre comercial no es válido.',
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos.',
  INVALID_CURRENT_PASSWORD: 'La contraseña actual es incorrecta.',
  INVALID_DATE_RANGE: 'La fecha final debe ser igual o posterior a la inicial.',
  INVALID_DAY_RANGE: 'El día de corte debe estar entre 1 y 25.',
  INVALID_DNI: 'El DNI debe tener 8 dígitos.',
  INVALID_EMAIL: 'El email no es válido.',
  INVALID_FULL_NAME: 'El nombre completo no es válido.',
  INVALID_GRACE_WEEKS: 'Las semanas de gracia solo aplican a compras en cuotas, no se repiten y la última semana siempre paga una cuota.',
  INVALID_INSTALLMENTS_COUNT: 'Una compra de fecha única no lleva cuotas.',
  INVALID_MAX_WEEKS: 'Las semanas máximas deben estar entre 1 y 99.',
  INVALID_NAME: 'El nombre no es válido.',
  INVALID_PASSWORD: 'La contraseña debe tener entre 8 y 128 caracteres.',
  INVALID_PAYMENT_TARGET: 'Ese tipo de pago necesita otro identificador.',
  INVALID_QUANTITY: 'Cada ítem necesita una cantidad de al menos 1.',
  INVALID_RATE: 'La tasa debe ser mayor que cero.',
  INVALID_RESET_TOKEN: 'El link para restablecer la contraseña no es válido o ya venció. Pide uno nuevo.',
  INVALID_RUC: 'El RUC debe tener 11 dígitos.',
  INVALID_TEXT: 'Uno de los textos tiene una longitud no válida.',
  INVALID_VALIDITY_PERIOD: 'El período debe terminar el mismo día o después de su inicio.',
  LATE_TEA_NOT_ABOVE_TEA: 'La TEA moratoria debe ser mayor que la TEA.',
  MAX_WEEKS_EXCEEDED: 'Las cuotas más las semanas de gracia superan las semanas máximas de este cliente.',
  NOT_SINGLE_DATE: 'Solo una compra de fecha única se paga de una vez.',
  NOT_WEEKLY: 'Solo una compra semanal tiene cuotas para cancelar.',
  NO_BCRP_CAP_IN_FORCE: 'No hay un tope BCRP vigente. Un administrador del sistema debe registrarlo.',
  NO_ITEMS: 'La compra necesita al menos un producto.',
  PARTIAL_PAYMENT_NOT_ALLOWED: 'El pago debe cubrir el monto completo.',
  PASSWORD_CHANGE_REQUIRED: 'Debes cambiar tu contraseña para continuar.',
  PASSWORD_UNCHANGED: 'La contraseña nueva debe ser distinta de la actual.',
  PAYMENT_DAY_NOT_AFTER_CUTOFF: 'El día de pago debe ser posterior al día de corte.',
  PAYMENT_EXCEEDS_DUE: 'El pago es mayor que el monto adeudado.',
  PAYMENT_KIND_MISMATCH: 'El tipo de pago no corresponde a lo seleccionado.',
  PREPAYMENT_WITH_OVERDUE: 'La compra tiene cuotas vencidas: págalas antes de cancelar el resto.',
  PRODUCT_CODE_TAKEN: 'Otro producto de la bodega ya tiene ese código.',
  PRODUCT_NOT_AVAILABLE: 'Algunos productos no existen, están inactivos o son de otra bodega.',
  PURCHASE_IN_FUTURE: 'La compra no puede tener fecha futura.',
  PURCHASE_IN_STATEMENT: 'La compra ya está facturada en un ciclo cerrado: paga el estado de cuenta.',
  PURCHASE_NOT_VOIDABLE: 'Solo se puede anular una compra sin pagos.',
  RATE_ABOVE_BCRP_CAP: 'La TEA supera el tope legal del BCRP.',
  RUC_TAKEN: 'Ya hay una bodega registrada con ese RUC.',
  STORE_INACTIVE: 'La bodega está desactivada.',
  STORE_NOT_TRUSTED:
    'Esta bodega no puede restaurar tu acceso. Pide el código en una bodega que ya ves en tu portal o contacta a soporte de AlToque Pay.',
  UNSUPPORTED_IMAGE_TYPE: 'La imagen debe ser JPEG, PNG o WebP.',
  USERNAME_TAKEN: 'Ya existe un usuario con ese DNI.',
  USER_INACTIVE: 'Este usuario fue desactivado.',
};

/** Nombre en español de cada campo que la API puede rechazar en un VALIDATION_ERROR. */
const FIELD_LABELS: Record<string, string> = {
  first_names: 'nombres',
  last_names: 'apellidos',
  full_name: 'nombre completo',
  business_name: 'nombre del negocio',
  ruc: 'RUC',
  dni: 'DNI',
  email: 'correo',
  phone: 'teléfono',
  address: 'dirección',
  password: 'contraseña',
  new_password: 'contraseña',
  current_password: 'contraseña',
  code: 'código',
  token: 'enlace',
  credit_limit: 'límite de crédito',
  cutoff_day: 'día de corte',
  default_cutoff_day: 'día de corte',
  payment_day: 'día de pago',
  default_payment_day: 'día de pago',
  tea: 'TEA',
  default_tea: 'TEA',
  late_tea: 'TEA moratoria',
  default_late_tea: 'TEA moratoria',
  max_weeks: 'semanas máximas',
  default_max_weeks: 'semanas máximas',
  max_tea: 'TEA máxima',
  valid_from: 'vigente desde',
  valid_to: 'vigente hasta',
  description: 'descripción',
  brand: 'marca',
  category: 'categoría',
  unit: 'unidad',
  supplier: 'proveedor',
  cash_price: 'precio al contado',
  list_price: 'precio de lista',
  quantity: 'cantidad',
  purchased_at: 'fecha de compra',
  installments_count: 'número de cuotas',
  grace_weeks: 'semanas de gracia',
  amount: 'monto',
  store_id: 'tienda',
  from: 'fecha inicial',
  to: 'fecha final',
};

export interface ParsedError {
  code: string;
  message: string;
  field: string | null;
  fieldErrors: Record<string, string>;
}

/** Extrae el código y un mensaje legible de un error del backend. */
export function parseError(err: unknown): ParsedError {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as Partial<ApiErrorBody> | null;
    if (err.status === 0 || !body || typeof body !== 'object' || !body.code) {
      return {
        code: err.status === 0 ? 'NETWORK' : `HTTP_${err.status}`,
        message: 'Error de conexión con el servidor.',
        field: null,
        fieldErrors: {},
      };
    }
    const fieldErrors: Record<string, string> = {};
    for (const e of body.details?.errors ?? []) fieldErrors[e.field] = e.message;
    let message = MESSAGES[body.code] ?? body.message ?? 'Ocurrió un error.';
    // Algunos mensajes del backend traen un valor útil (monto, tope, fecha): lo añadimos.
    const detail = extractValue(body.message ?? '');
    if (detail && ['CREDIT_LIMIT_EXCEEDED', 'RATE_ABOVE_BCRP_CAP', 'MAX_WEEKS_EXCEEDED', 'PAYMENT_EXCEEDS_DUE',
      'PARTIAL_PAYMENT_NOT_ALLOWED', 'NO_BCRP_CAP_IN_FORCE', 'CYCLE_CLOSED'].includes(body.code)) {
      message += ` (${detail})`;
    }
    if (body.code === 'VALIDATION_ERROR' && body.field) {
      // El mensaje de la API viene en inglés: solo usamos el campo (items.0.quantity → quantity).
      const label = FIELD_LABELS[body.field.split('.').pop()!];
      message = label ? `Revisa el campo "${label}".` : MESSAGES['VALIDATION_ERROR'];
    }
    if (body.code === 'INVALID_DAY_RANGE' && body.field === 'payment_day') message = 'El día de pago debe estar entre 1 y 28.';
    return { code: body.code, message, field: body.field ?? null, fieldErrors };
  }
  return { code: 'UNKNOWN', message: 'Ocurrió un error inesperado.', field: null, fieldErrors: {} };
}

function extractValue(msg: string): string | null {
  const m = msg.match(/\((?:max\s*)?([^)]+)\)/) ?? msg.match(/on ([\d-]+)/) ?? msg.match(/of ([\d/]+)/);
  return m ? m[1].trim() : null;
}
