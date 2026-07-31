import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Attachment } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useRef } from 'react';

interface Props {
  type: 'userstories' | 'tasks' | 'issues' | 'epics' | 'wiki';
  objectId: number;
  projectId: number;
  fetchFn: (params: { project: number; object_id: number }) => Promise<{ data: Attachment[] }>;
  createFn: (data: FormData) => Promise<{ data: Attachment }>;
  deleteFn: (id: number) => Promise<unknown>;
}

export default function AttachmentsPanel({ type, objectId, projectId, fetchFn, createFn, deleteFn }: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  void type;

  const { data: attachments, isLoading } = useQuery({
    queryKey: ['attachments', type, objectId],
    queryFn: async () => {
      const res = await fetchFn({ project: projectId, object_id: objectId });
      return res.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('attached_file', file);
      formData.append('project', String(projectId));
      formData.append('object_id', String(objectId));
      return createFn(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', type, objectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', type, objectId] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        uploadMutation.mutate(files[i]);
      }
    }
  };

  return (
    <div className="attachments-panel">
      <div className="attachments-header">
        <h3>Attachments ({attachments?.length || 0})</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
          + Add attachment
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      {isLoading ? (
        <p>Loading attachments...</p>
      ) : (
        <div className="attachments-list">
          {attachments?.map((att: Attachment) => (
            <div key={att.id} className="attachment-item">
              <a href={att.url || att.attached_file} target="_blank" rel="noopener noreferrer" className="attachment-name">
                {att.name}
              </a>
              <span className="attachment-size">{(att.size / 1024).toFixed(1)} KB</span>
              <span className="attachment-date">
                {formatDistanceToNow(new Date(att.created_date), { addSuffix: true })}
              </span>
              <button className="btn-icon delete-btn" onClick={() => deleteMutation.mutate(att.id)} title="Delete">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
