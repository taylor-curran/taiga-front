import { Navigate } from 'react-router-dom';
import type { TaigaUser } from '../../api/types';
import { resolveNavUrl } from '../../lib/navUrls';
import { HomePage } from './HomePage';

type Props = { user: TaigaUser | null };

/** Mirrors `Home` controller: anonymous users go to discover. */
export function HomeGate({ user }: Props) {
  if (!user) {
    return <Navigate to={`/${resolveNavUrl('discover')}`} replace />;
  }
  return <HomePage user={user} />;
}
