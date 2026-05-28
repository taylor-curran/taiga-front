import { Navigate, useParams } from "react-router-dom";

export default function WikiRedirectPage() {
  const { pslug } = useParams();
  return <Navigate to={`/project/${pslug}/wiki/home`} replace />;
}
