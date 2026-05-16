export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency || "PEN",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || "PEN"} ${amount.toLocaleString("es-PE")}`;
  }
}

export function formatDate(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "Fecha por confirmar";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}
