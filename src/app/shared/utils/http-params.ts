import { HttpParams } from '@angular/common/http';

export type QueryValue = string | number | boolean | null | undefined;

/** Construye los query params omitiendo los valores vacíos. */
export function toHttpParams(q: Record<string, QueryValue>): HttpParams {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(q)) {
    if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
  }
  return p;
}
