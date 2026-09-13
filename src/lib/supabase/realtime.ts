export function realtimeTopic(base: string): string {
  const salt = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${base}-${salt}`;
}

/**
 * Deterministic channel shared by BOTH participants of the admin <-> helper
 * support chat. Unlike realtimeTopic() this is NOT salted: every client must
 * subscribe to the exact same name to see each other's messages live.
 */
export const ADMIN_MESSAGES_CHANNEL = "admin-messages";