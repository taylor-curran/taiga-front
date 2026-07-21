import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResolver } from '../hooks/useProject';
import Loader from '../components/common/Loader';

export default function DetailRouterPage() {
  const { pslug, ref } = useParams<{ pslug: string; ref: string }>();
  const { data: resolverData, isLoading } = useResolver(pslug || '', { ref: Number(ref) });
  const navigate = useNavigate();

  useEffect(() => {
    if (!resolverData || !pslug) return;
    if (resolverData.us) {
      navigate(`/project/${pslug}/us/${ref}`, { replace: true });
    } else if (resolverData.task) {
      navigate(`/project/${pslug}/task/${ref}`, { replace: true });
    } else if (resolverData.issue) {
      navigate(`/project/${pslug}/issue/${ref}`, { replace: true });
    } else if (resolverData.epic) {
      navigate(`/project/${pslug}/epic/${ref}`, { replace: true });
    }
  }, [resolverData, pslug, ref, navigate]);

  if (isLoading) return <Loader />;
  return <Loader />;
}
