import type { WikiPage } from '@/types/api';

export function WikiSummary({ wiki }: { wiki: WikiPage }) {
  return (
    <div className="flex items-center gap-6 text-xs text-taiga-grey-light mt-4 pt-4 border-t border-taiga-grey-lighter/40">
      {wiki.modified_date && (
        <div>
          <span className="text-taiga-text font-medium">
            {new Date(wiki.modified_date).toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>{' '}
          last edit
        </div>
      )}
      {wiki.editions !== undefined && (
        <div>
          <span className="text-taiga-text font-medium">{wiki.editions}</span>{' '}
          {wiki.editions === 1 ? 'edition' : 'editions'}
        </div>
      )}
    </div>
  );
}
