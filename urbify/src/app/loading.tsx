// loading.tsx intentionally returns null — the UrbifyApp component manages its own
// loading states internally. Returning a <main> here caused it to persist in the DOM
// alongside the rendered page content (two visible elements at once).
export default function Loading() {
  return null;
}
