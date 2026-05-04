import { useState, useEffect, useCallback } from 'react';

interface InviteMembersModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (emails: string[], roleId?: number) => void;
  roles?: { id: number; name: string }[];
}

export function InviteMembersModal({
  open,
  onClose,
  onInvite,
  roles,
}: InviteMembersModalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | undefined>(
    roles?.[0]?.id,
  );
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (open) {
      setEmails([]);
      setEmailInput('');
      setError(null);
      setSelectedRole(roles?.[0]?.id);
    }
  }, [open, roles]);

  if (!open) return null;

  const addEmail = () => {
    const trimmed = emailInput.trim();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Invalid email address');
      return;
    }
    if (emails.includes(trimmed)) {
      setError('Email already added');
      return;
    }
    setEmails([...emails, trimmed]);
    setEmailInput('');
    setError(null);
  };

  const removeEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleSubmit = () => {
    if (emails.length === 0) {
      setError('Add at least one email');
      return;
    }
    onInvite(emails, selectedRole);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-taiga-grey-lighter">
          <h2 className="text-sm font-semibold">Invite members</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-taiga-grey hover:text-taiga-text text-lg leading-none"
          >
            {'\u00D7'}
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-xs font-medium text-taiga-text mb-1">
              Email addresses
            </label>
            <div className="flex gap-2">
              <input
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEmail();
                  }
                }}
                placeholder="user@example.com"
                className="input flex-1"
                autoFocus
              />
              <button type="button" onClick={addEmail} className="btn-ghost text-xs">
                Add
              </button>
            </div>
            {error && <p className="text-xs text-taiga-red mt-1">{error}</p>}
          </div>

          {/* Email list */}
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {emails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-taiga-bg text-taiga-text"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="text-taiga-grey hover:text-taiga-red"
                  >
                    {'\u00D7'}
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Role selector */}
          {roles && roles.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-taiga-text mb-1">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(Number(e.target.value))}
                className="input"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-taiga-grey-lighter">
          <button type="button" onClick={onClose} className="btn-ghost text-xs">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary text-xs"
            disabled={emails.length === 0}
          >
            Send invitations
          </button>
        </div>
      </div>
    </div>
  );
}
