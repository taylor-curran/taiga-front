import DOMPurify from 'dompurify';

// Centralised HTML sanitiser used everywhere the app falls back to
// `dangerouslySetInnerHTML`. Belt-and-braces: even when the backend renders
// `description_html` server-side it can be rendered here, so we still scrub it
// before injecting into the DOM. Importantly, the wiki page falls back to
// `marked.parse(content)` which preserves arbitrary HTML by design — that path
// MUST be sanitised to avoid stored XSS.
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';
  return DOMPurify.sanitize(input);
}
