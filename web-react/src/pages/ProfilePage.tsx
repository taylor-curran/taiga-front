import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { users, timeline } from '../api/resources';
import { useAuthStore } from '../stores/auth';
import type { TimelineEntry } from '../types';
import Loader from '../components/common/Loader';
import { getAvatarUrl } from '../utils/gravatar';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

export default function ProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'timeline' | 'contacts' | 'liked' | 'voted' | 'watched'>('timeline');

  const userId = slug ? Number(slug) : currentUser?.id;

  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user');
      const res = await users.getById(userId);
      return res.data;
    },
    enabled: !!userId,
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await users.getStats(userId);
      return res.data;
    },
    enabled: !!userId,
  });

  const { data: timelineData } = useQuery({
    queryKey: ['profile-timeline', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await timeline.getProfileTimeline(userId, { page_size: 20 });
      return res.data;
    },
    enabled: !!userId && tab === 'timeline',
  });

  if (userLoading) return <Loader />;
  if (!profileUser) return <div className="error-page"><h1>User not found</h1></div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img src={getAvatarUrl(profileUser)} alt={profileUser.full_name_display} className="profile-avatar" />
        <div className="profile-info">
          <h1>{profileUser.full_name_display}</h1>
          <span className="profile-username">@{profileUser.username}</span>
          {profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>}
        </div>
      </div>

      {stats && (
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{(stats as Record<string, unknown>).total_num_projects as number || 0}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{(stats as Record<string, unknown>).total_num_contacts as number || 0}</span>
            <span className="stat-label">Contacts</span>
          </div>
        </div>
      )}

      <div className="profile-tabs">
        <button className={tab === 'timeline' ? 'active' : ''} onClick={() => setTab('timeline')}>Timeline</button>
        <button className={tab === 'contacts' ? 'active' : ''} onClick={() => setTab('contacts')}>Contacts</button>
        <button className={tab === 'liked' ? 'active' : ''} onClick={() => setTab('liked')}>Liked</button>
        <button className={tab === 'voted' ? 'active' : ''} onClick={() => setTab('voted')}>Voted</button>
        <button className={tab === 'watched' ? 'active' : ''} onClick={() => setTab('watched')}>Watched</button>
      </div>

      <div className="profile-content">
        {tab === 'timeline' && (
          <div className="timeline-list">
            {timelineData?.map((entry: TimelineEntry) => (
              <div key={entry.id} className="timeline-item">
                <span className="timeline-type">{entry.event_type.replace(/\./g, ' ')}</span>
                <span className="timeline-date">
                  {formatDistanceToNow(new Date(entry.created), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentUser?.id === profileUser.id && (
        <div className="profile-actions">
          <Link to="/user-settings/user-profile" className="btn btn-secondary">Edit profile</Link>
        </div>
      )}
    </div>
  );
}
