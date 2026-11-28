/**
 * La TEA moratoria debe ser mayor que la TEA: atrasarse cuesta más que pagar a tiempo. No tiene
 * tope del BCRP; el tope solo limita la TEA. Devuelve el problema o null si no hay.
 */
export function lateTeaProblem(
  tea: string | number | null | undefined,
  lateTea: string | number | null | undefined,
): string | null {
  if (tea === null || tea === undefined || tea === '') return null;
  if (lateTea === null || lateTea === undefined || lateTea === '') return null;
  return Number(lateTea) > Number(tea) ? null : 'La TEA moratoria debe ser mayor que la TEA.';
}
