// Minimal Markdown renderer. The reference app renders preformatted HTML returned
// by the API as `description_html` / `comment_html` / `html`; we prefer that
// when available and only fall back to a tiny client-side renderer for raw
// markdown the back-end didn't pre-render.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(line: string): string {
  let out = escapeHtml(line);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^\w])\*([^*]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/(^|[^\w])_([^_]+)_/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return out;
}

export function renderMarkdown(text: string | undefined | null): string {
  if (!text) return '';
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let inCode = false;
  let inList = false;
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${para.map(renderInline).join('<br/>')}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    if (/^```/.test(raw)) {
      flushPara();
      closeList();
      if (inCode) {
        out.push('</code></pre>');
        inCode = false;
      } else {
        out.push('<pre><code>');
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      out.push(escapeHtml(raw) + '\n');
      continue;
    }
    if (raw.trim() === '') {
      flushPara();
      closeList();
      continue;
    }
    const h = raw.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      closeList();
      const lvl = h[1].length;
      out.push(`<h${lvl}>${renderInline(h[2])}</h${lvl}>`);
      continue;
    }
    const li = raw.match(/^[-*]\s+(.*)$/);
    if (li) {
      flushPara();
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${renderInline(li[1])}</li>`);
      continue;
    }
    closeList();
    para.push(raw);
  }
  flushPara();
  closeList();
  if (inCode) out.push('</code></pre>');
  return out.join('');
}

export function Markdown({ html, source, className = '' }: { html?: string | null; source?: string | null; className?: string }) {
  const value = html && html.trim() ? html : renderMarkdown(source ?? '');
  return (
    <div
      className={`prose prose-sm max-w-none text-slate-700 [&>p]:my-2 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_a]:text-taiga-600 [&_pre]:bg-slate-100 [&_pre]:p-3 [&_pre]:rounded [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-0.5 ${className}`}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}
