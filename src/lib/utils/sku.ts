export function generateSku(prefix?: string): string {
  const cleanPrefix = String(prefix || "PROD")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 12) || "PROD";

  let rand = "";
  try {
    const arr = new Uint32Array(2);
    crypto.getRandomValues(arr);
    rand = Array.from(arr)
      .map((n) => n.toString(36).toUpperCase())
      .join("")
      .slice(0, 8);
  } catch {
    rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  }

  return `${cleanPrefix}-${rand}`;
}
