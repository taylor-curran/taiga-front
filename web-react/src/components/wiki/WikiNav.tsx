import { useState, useRef, KeyboardEvent } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useWikiLinks,
  useCreateWikiLink,
  useDeleteWikiLink,
} from '@/services/wiki';

export function WikiNav({ activeSlug }: { activeSlug?: string }) {
  const project = useCurrentProject();
  const { data: links } = useWikiLinks(project.id);
  const createLink = useCreateWikiLink(project.id);
  const removeLink = useDeleteWikiLink(project.id);
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const canAdd = project.my_permissions?.includes('add_wiki_link');
  const canDelete = project.my_permissions?.includes('delete_wiki_link');

  const sorted = links ? [...links].sort((a, b) => a.order - b.order) : [];

  const handleAdd = () => {
    const value = inputRef.current?.value.trim();
    if (!value) return;
    createLink.mutate(
      { project: project.id, title: value },
      {
        onSuccess: () => {
          if (inputRef.current) inputRef.current.value = '';
          setAdding(false);
        },
      },
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') setAdding(false);
  };

  const handleDelete = (linkId: number, title: string) => {
    if (!window.confirm(`Delete wiki link "${title}"?`)) return;
    removeLink.mutate(linkId);
  };

  return (
    <nav className="space-y-1 mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-taiga-grey-light px-3 mb-2">
        Wiki
      </h3>

      {/* Fixed home link */}
      <NavLink
        to={`/project/${project.slug}/wiki/home`}
        className={({ isActive }) =>
          clsx(
            'nav-link flex items-center',
            (isActive || activeSlug === 'home') && 'nav-link-active',
          )
        }
      >
        Home
      </NavLink>

      {/* Wiki links */}
      {sorted.map((link) => (
        <div key={link.id} className="group flex items-center">
          <NavLink
            to={`/project/${project.slug}/wiki/${link.href}`}
            className={({ isActive }) =>
              clsx(
                'nav-link flex-1 truncate',
                (isActive || activeSlug === link.href) && 'nav-link-active',
              )
            }
          >
            {link.title}
          </NavLink>
          {canDelete && (
            <button
              type="button"
              onClick={() => handleDelete(link.id, link.title)}
              className="hidden group-hover:block px-2 text-taiga-red text-xs hover:text-taiga-red/80"
              title="Delete link"
            >
              &times;
            </button>
          )}
        </div>
      ))}

      {/* Add new link */}
      {canAdd && (
        <>
          {adding ? (
            <div className="px-3 py-1">
              <input
                ref={inputRef}
                type="text"
                className="input text-xs"
                placeholder="Link name…"
                autoFocus
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (!inputRef.current?.value.trim()) setAdding(false);
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="nav-link text-taiga-green-dark text-xs font-semibold w-full text-left"
            >
              + Add link
            </button>
          )}
        </>
      )}

      {/* All pages link */}
      {sorted.length > 0 && (
        <NavLink
          to={`/project/${project.slug}/wiki-list`}
          className="nav-link text-xs text-taiga-grey-light"
        >
          All pages
        </NavLink>
      )}
    </nav>
  );
}
