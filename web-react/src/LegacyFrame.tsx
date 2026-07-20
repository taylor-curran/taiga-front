import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { legacyFrameSrc } from './legacyUrls';

export default function LegacyFrame() {
  const { pathname, search, hash } = useLocation();
  const src = useMemo(() => legacyFrameSrc(pathname, search, hash), [pathname, search, hash]);

  return (
    <iframe
      title="Taiga"
      className="legacy-frame"
      src={src}
      // Full-viewport embedded legacy app (AngularJS reference build).
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
