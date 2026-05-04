import { useState } from 'react';

interface NewStoryFormProps {
  onSubmit: (subject: string) => void;
  onCancel: () => void;
}

export function NewStoryForm({ onSubmit, onCancel }: NewStoryFormProps) {
  const [subject, setSubject] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    onSubmit(subject.trim());
    setSubject('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 bg-taiga-bg/60 border-t border-taiga-grey-lighter/40">
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="New user story title..."
        className="flex-1 border border-taiga-grey-lighter rounded px-3 py-2 text-sm focus:outline-none focus:border-taiga-primary"
        autoFocus
      />
      <button
        type="submit"
        className="px-3 py-2 bg-taiga-primary text-white text-sm rounded hover:bg-taiga-primary/90"
      >
        Add
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-2 text-sm text-taiga-grey-light hover:text-taiga-text"
      >
        Cancel
      </button>
    </form>
  );
}
