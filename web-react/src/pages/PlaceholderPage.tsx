import { useTranslation } from 'react-i18next';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

type Props = { titleKey?: string; description?: string };

export function PlaceholderPage({ titleKey, description }: Props) {
  const { t } = useTranslation();
  const title = titleKey ? t(titleKey) : 'Taiga';
  useDocumentMeta(title, description);
  return (
    <div className="tg-placeholder">
      <p>
        This screen is not ported yet in the React build. The Angular reference app at port 4200 implements the full UI.
      </p>
    </div>
  );
}
