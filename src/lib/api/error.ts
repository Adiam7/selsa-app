import type { AxiosError } from "axios";

function isObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function pickFirstString(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const v of value) {
      const s = pickFirstString(v);
      if (s) return s;
    }
    return null;
  }
  if (isObject(value)) {
    // Common DRF patterns: {detail: '...'} or {field: ['...']}
    if (typeof (value as any).detail === "string") return (value as any).detail;
    for (const key of Object.keys(value)) {
      const s = pickFirstString((value as any)[key]);
      if (s) return `${key}: ${s}`;
    }
  }
  return null;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const anyErr = err as any;
  const data = anyErr?.response?.data;

  // DRF validation errors
  const fromData = pickFirstString(data);
  if (fromData) return fromData;

  // Axios default message
  if (typeof anyErr?.message === "string" && anyErr.message) return anyErr.message;

  return fallback;
}
