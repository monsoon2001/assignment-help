export function realtimeTopic(base: string): string {
  const salt = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${base}-${salt}`;
}