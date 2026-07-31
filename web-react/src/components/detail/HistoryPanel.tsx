import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { History } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import api from '../../api/client';

interface Props {
  type: 'userstory' | 'task' | 'issue' | 'epic' | 'wiki';
  objectId: number;
  projectId: number;
}

export default function HistoryPanel({ type, objectId, projectId }: Props) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: history, isLoading } = useQuery({
    queryKey: ['history', type, objectId],
    queryFn: async () => {
      const res = await api.get<History[]>(`/history/${type}/${objectId}`);
      return res.data;
    },
  });

  const postCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const contentType = type === 'userstory' ? 'userstories' : type === 'wiki' ? 'wiki' : `${type}s`;
      await api.patch(`/${contentType}/${objectId}`, {
        comment: text,
        version: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history', type, objectId] });
      setComment('');
    },
    onError: async (err: unknown) => {
      void err;
      void projectId;
    },
  });

  if (isLoading) return <div className="history-loading">Loading activity...</div>;

  const comments = history?.filter((h) => h.comment) || [];
  const activities = history?.filter((h) => !h.comment && !h.is_hidden) || [];

  return (
    <div className="history-panel">
      <div className="comment-form">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
        />
        <button
          className="btn btn-primary"
          onClick={() => postCommentMutation.mutate(comment)}
          disabled={!comment.trim() || postCommentMutation.isPending}
        >
          Comment
        </button>
      </div>
      <div className="history-entries">
        <h3>Comments ({comments.length})</h3>
        {comments.map((entry) => (
          <div key={entry.id} className="history-entry comment-entry">
            <div className="history-user">
              <strong>{entry.user.name}</strong>
              <span className="history-date">
                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="comment-body" dangerouslySetInnerHTML={{ __html: entry.comment_html }} />
          </div>
        ))}
        <h3>Activity ({activities.length})</h3>
        {activities.map((entry) => (
          <div key={entry.id} className="history-entry activity-entry">
            <div className="history-user">
              <strong>{entry.user.name}</strong>
              <span className="history-date">
                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="activity-changes">
              {Object.entries(entry.values_diff).map(([key, value]) => (
                <div key={key} className="activity-change">
                  <span className="change-field">{key}:</span>
                  <span className="change-value">{JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
