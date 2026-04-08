import { parse } from "url";

// Получение ID из query-параметров
export function getIdFromUrl(url: string | undefined): number | null {
  if (!url) return null;
  const parsed = parse(url, true);
  const id = parsed.query.id;
  return id ? Number(id) : null;
}

export function getPathname(url: string | undefined): string {
  if (!url) return "";
  const pathname = parse(url, true).pathname || "";
  return pathname;
}
