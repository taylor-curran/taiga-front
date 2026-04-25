import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useResolve } from '../../api/resources';
import { Loader } from '../../components/Loader';

export default function RefRouter() {
  const { pslug, ref } = useParams();
  const refNum = ref ? Number(ref) : undefined;
  const { data, isLoading, error } = useResolve(pslug, refNum);
  const nav = useNavigate();

  useEffect(() => {
    if (!data) return;
    if (data.us) nav(`/project/${pslug}/us/${refNum}`, { replace: true });
    else if (data.task) nav(`/project/${pslug}/task/${refNum}`, { replace: true });
    else if (data.issue) nav(`/project/${pslug}/issue/${refNum}`, { replace: true });
    else if (data.epic) nav(`/project/${pslug}/epic/${refNum}`, { replace: true });
    else nav(`/not-found`, { replace: true });
  }, [data, nav, pslug, refNum]);

  if (error) return <div className="p-8 text-center text-slate-500">Could not resolve reference.</div>;
  if (isLoading) return <Loader />;
  return <Loader />;
}
