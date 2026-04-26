import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router';
import type { AdminPathDef } from '@/routes/adminRoutePaths';
import { DEMO_PROJECT_SLUG } from '@/routes/adminRoutePaths';

type Props = {
  def: AdminPathDef;
  pageGroup: string;
};

/**
 * No data fetching: static port-pending copy for every admin port route.
 */
export default function PlaceholderPage({ def, pageGroup }: Props) {
  const location = useLocation();
  const params = useParams();

  const pathDisplay = useMemo(() => {
    const extras = { ...params };
    if (!extras.pslug) extras.pslug = DEMO_PROJECT_SLUG;
    return { pathname: location.pathname, params: extras };
  }, [location.pathname, params]);

  return (
    <article
      className="admin-placeholder-article"
      data-testid="admin-placeholder"
      data-feature={def.featureLabel}
    >
      <header className="admin-placeholder-article__header">
        <p className="admin-placeholder-article__eyebrow">{pageGroup}</p>
        <h1 className="admin-placeholder-article__title">{def.featureLabel}</h1>
      </header>
      <div className="port-pending" data-testid="port-pending-banner">
        <h2 className="port-pending__title">Port pending — this is the admin {def.featureLabel} page</h2>
        <p className="port-pending__path">
          Reference: AngularJS 1.5 + Jade in <code>app/</code> (unchanged). No API calls in this
          foundation build.
        </p>
        <p className="port-pending__path">{def.description}</p>
        <pre className="admin-placeholder-article__json" data-testid="path-debug">
          {JSON.stringify(pathDisplay, null, 2)}
        </pre>
      </div>
    </article>
  );
}
