import { useMemo } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(html: string): TocItem[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const items: TocItem[] = [];
  headings.forEach((el, index) => {
    const text = el.textContent?.trim() ?? '';
    if (!text) return;
    const level = parseInt(el.tagName.charAt(1), 10);
    const id = el.id || `heading-${index}`;
    items.push({ id, text, level });
  });
  return items;
}

export function WikiToc({ html }: { html: string }) {
  const items = useMemo(() => extractHeadings(html), [html]);

  if (items.length < 2) return null;

  return (
    <nav className="card p-4 mb-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-taiga-grey-light mb-2">
        Table of Contents
      </h4>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              className="text-taiga-link hover:underline"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
