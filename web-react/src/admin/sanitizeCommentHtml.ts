import DOMPurify from 'dompurify';

export function sanitizeCommentHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}
