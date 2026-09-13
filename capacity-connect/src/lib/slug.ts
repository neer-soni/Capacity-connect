export function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "item";
}

export function uniqueSlug(value: string, suffix?: string): string {
  const base = slugify(value);
  return suffix ? `${base}-${suffix}` : base;
}

export function usernameFromEmail(email: string): string {
  return slugify(email.split("@")[0] || "user");
}
