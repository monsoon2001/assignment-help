/**
 * Makes a user-supplied file name safe to embed in a storage object path.
 * Strips directory separators and control characters so a name like
 * `../../x.pdf` can never escape the UUID-prefixed folder.
 */
export function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 120);
  return cleaned || "file";
}
