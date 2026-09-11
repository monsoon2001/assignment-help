export function unwrapRow<T>(value: unknown): T | null {
  if (Array.isArray(value)) {
    return (value[0] as T) ?? null;
  }
  return (value as T) ?? null;
}