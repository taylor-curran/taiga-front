import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LIKE_ORDERS = [
  '-total_fans_last_week',
  '-total_fans_last_month',
  '-total_fans_last_year',
  '-total_fans',
] as const;

const ACTIVITY_ORDERS = [
  '-total_activity_last_week',
  '-total_activity_last_month',
  '-total_activity_last_year',
  '-total_activity',
] as const;

type Props = {
  orderBy: string;
  onChangeOrder: (orderBy: string) => void;
};

export function DiscoverSearchListHeader({ orderBy, onChangeOrder }: Props) {
  const { t } = useTranslation();
  const [likeOpen, setLikeOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);

  const setOrder = (v: string) => {
    onChangeOrder(v);
  };

  return (
    <div className="discover-results-header">
      <div className="discover-results-header-inner">
        <div className="title">
          <span aria-hidden>⌕</span>
          <h2 style={{ margin: 0 }}>{t('DISCOVER.SEARCH.RESULTS')}</h2>
        </div>
        <div className="discover-search-filters">
          <a
            href="#"
            className={likeOpen ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setLikeOpen(!likeOpen);
              setActivityOpen(false);
            }}
          >
            {t('DISCOVER.MOST_LIKED')}
          </a>
          <a
            href="#"
            className={activityOpen ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              setActivityOpen(!activityOpen);
              setLikeOpen(false);
            }}
          >
            {t('DISCOVER.MOST_ACTIVE')}
          </a>
        </div>
      </div>
      {likeOpen && (
        <div className="discover-subfilter">
          {orderBy && (
            <a href="#" onClick={(e) => { e.preventDefault(); setOrder(''); }}>
              {t('DISCOVER.FILTERS.CLEAR')}
            </a>
          )}
          <ul>
            {LIKE_ORDERS.map((o) => (
              <li key={o}>
                <a
                  href="#"
                  className={orderBy === o ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setOrder(o); }}
                >
                  {orderLabel(t, o)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {activityOpen && (
        <div className="discover-subfilter">
          {orderBy && (
            <a href="#" onClick={(e) => { e.preventDefault(); setOrder(''); }}>
              {t('DISCOVER.FILTERS.CLEAR')}
            </a>
          )}
          <ul>
            {ACTIVITY_ORDERS.map((o) => (
              <li key={o}>
                <a
                  href="#"
                  className={orderBy === o ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setOrder(o); }}
                >
                  {orderLabel(t, o)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function orderLabel(t: (k: string) => string, o: string): string {
  if (o.includes('week')) return t('DISCOVER.FILTERS.WEEK');
  if (o.includes('month')) return t('DISCOVER.FILTERS.MONTH');
  if (o.includes('year')) return t('DISCOVER.FILTERS.YEAR');
  return t('DISCOVER.FILTERS.ALL_TIME');
}
