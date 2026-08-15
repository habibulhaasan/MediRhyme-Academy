// Formats a plain ISO date string (from an <input type="date">, e.g.
// "2026-08-20") into a readable Bangla date like "২০ আগস্ট, ২০২৬". Falls
// back to returning whatever was stored as-is (so old free-text deadlines
// like "শীঘ্রই ঘোষণা হবে" keep working without a migration).
export function formatBnDate(value?: string): string {
  if (!value) return "";
  const isIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!isIsoDate) return value;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  try {
    return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date);
  }
}