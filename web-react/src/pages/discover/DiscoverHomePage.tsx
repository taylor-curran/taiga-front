import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DiscoverSearchBar } from './DiscoverSearchBar';
import { FeaturedProjects } from './FeaturedProjects';
import { MostLiked } from './MostLiked';
import { MostActive } from './MostActive';
import { resolveNavUrl } from '../../lib/navUrls';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export function DiscoverHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useDocumentMeta(t('DISCOVER.PAGE_TITLE'), t('DISCOVER.PAGE_DESCRIPTION'));

  const onSubmit = (q: string) => {
    const base = resolveNavUrl('discover-search');
    const sp = new URLSearchParams();
    if (q) sp.set('text', q);
    navigate({ pathname: `/${base}`, search: sp.toString() ? `?${sp.toString()}` : '' });
  };

  return (
    <section className="discover">
      <header>
        <DiscoverSearchBar mode="home" onSubmit={onSubmit} />
      </header>
      <FeaturedProjects />
      <div className="discover-two-col">
        <MostLiked />
        <MostActive />
      </div>
    </section>
  );
}
