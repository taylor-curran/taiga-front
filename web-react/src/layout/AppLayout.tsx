import { Outlet } from 'react-router-dom';
import { TopNav } from '../components/TopNav';
import type { TaigaUser } from '../api/types';
import { useTaigaConfig } from '../contexts/ConfigContext';

type Props = { user: TaigaUser | null; hideHeader?: boolean };

export function AppLayout({ user, hideHeader }: Props) {
  const config = useTaigaConfig();
  const register = config.publicRegisterEnabled !== false;

  return (
    <>
      {!hideHeader && <TopNav user={user} publicRegisterEnabled={register} />}
      <main className="tg-main">
        <Outlet />
      </main>
    </>
  );
}
