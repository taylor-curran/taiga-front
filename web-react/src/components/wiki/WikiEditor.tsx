import { useState, useCallback, useEffect } from 'react';
import { marked } from 'marked';
import { sanitizeHtml } from '@/lib/sanitize';

interface WikiEditorProps {
  initialContent: string;
  saving?: boolean;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export function WikiEditor({
  initialContent,
  saving,
  onSave,
  onCancel,
}: WikiEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const html = useCallback(() => {
    return sanitizeHtml(marked.parse(content) as string);
  }, [content]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-taiga-grey-lighter/40 pb-2">
        <button
          type="button"
          className={`text-xs px-3 py-1 rounded ${!preview ? 'bg-taiga-green-dark text-white' : 'text-taiga-grey'}`}
          onClick={() => setPreview(false)}
        >
          Write
        </button>
        <button
          type="button"
          className={`text-xs px-3 py-1 rounded ${preview ? 'bg-taiga-green-dark text-white' : 'text-taiga-grey'}`}
          onClick={() => setPreview(true)}
        >
          Preview
        </button>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div
          className="prose max-w-none text-sm min-h-[200px] p-3 border border-taiga-grey-lighter rounded bg-white"
          dangerouslySetInnerHTML={{ __html: html() }}
        />
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input min-h-[300px] font-mono text-sm resize-y"
          placeholder="Write your wiki page content in Markdown…"
        />
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-primary text-sm"
          disabled={saving}
          onClick={() => onSave(content)}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          className="btn-ghost text-sm"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
