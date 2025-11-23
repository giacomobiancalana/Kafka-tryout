export function serializzatore<T>(payload: T): string {
  return JSON.stringify(payload);
}

export function deserializzatore<T>(value?: Buffer | string | null): T | null {
  if (!value) return null;

  const raw = Buffer.isBuffer(value) ? value.toString("utf-8") : value;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error("[jsonSerde] Errore nel parse JSON:", error);
    console.error("[jsonSerde] Valore grezzo:", raw);
    return null;
  }
}
