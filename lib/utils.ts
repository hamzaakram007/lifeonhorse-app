export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPrice(price: number | null, currency = "USD"): string {
  if (price == null) return "Price on request";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}

export function formatDate(date: string | null): string {
  if (!date) return "TBA";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function countryLabel(code: string | null): string {
  if (!code) return "—";
  const map: Record<string, string> = {
    PK: "Pakistan",
    IN: "India",
    TR: "Turkey",
    ZA: "South Africa",
    AZ: "Azerbaijan",
    TM: "Turkmenistan",
  };
  return map[code] ?? code;
}

export function isAdminRole(role: string): boolean {
  return role === "admin" || role === "moderator";
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
