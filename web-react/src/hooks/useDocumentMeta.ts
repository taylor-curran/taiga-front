import { useEffect } from 'react';

export function useDocumentMeta(title: string, description?: string): void {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const prevDesc = meta?.content;
    if (description) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
    return () => {
      document.title = prevTitle;
      if (meta && prevDesc !== undefined) meta.content = prevDesc ?? '';
    };
  }, [title, description]);
}
