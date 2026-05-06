import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { projects } from '../api/resources';
import Loader from '../components/common/Loader';
import { useState } from 'react';

export default function TransferProjectPage() {
  const { pslug, token } = useParams<{ pslug: string; token: string }>();
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<'accepted' | 'rejected' | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project-transfer', pslug],
    queryFn: async () => {
      const res = await projects.getBySlug(pslug!);
      return res.data;
    },
    enabled: !!pslug,
  });

  const acceptMutation = useMutation({
    mutationFn: () => projects.transferAccept(project!.id, token!, reason || undefined),
    onSuccess: () => setResult('accepted'),
  });

  const rejectMutation = useMutation({
    mutationFn: () => projects.transferReject(project!.id, token!, reason || undefined),
    onSuccess: () => setResult('rejected'),
  });

  if (isLoading) return <Loader />;
  if (!project) return <div className="error-page"><h1>Project not found</h1></div>;

  if (result === 'accepted') {
    return (
      <div className="transfer-page">
        <h1>Transfer Accepted</h1>
        <p>You are now the owner of <strong>{project.name}</strong>.</p>
      </div>
    );
  }

  if (result === 'rejected') {
    return (
      <div className="transfer-page">
        <h1>Transfer Rejected</h1>
        <p>The ownership transfer for <strong>{project.name}</strong> has been rejected.</p>
      </div>
    );
  }

  return (
    <div className="transfer-page">
      <h1>Project Ownership Transfer</h1>
      <p>You've been invited to become the owner of <strong>{project.name}</strong>.</p>
      <div className="form-field">
        <label>Reason (optional)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Optional reason..."
        />
      </div>
      <div className="transfer-actions">
        <button
          className="btn btn-primary"
          onClick={() => acceptMutation.mutate()}
          disabled={acceptMutation.isPending}
        >
          Accept ownership
        </button>
        <button
          className="btn btn-danger"
          onClick={() => rejectMutation.mutate()}
          disabled={rejectMutation.isPending}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
