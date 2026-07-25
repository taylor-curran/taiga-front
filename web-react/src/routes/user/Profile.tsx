import { useParams } from 'react-router-dom';
import { useAuth } from '../../api/auth';
import { useUser, useUserContacts, useUserTimeline } from '../../api/resources';
import { Avatar } from '../../components/Avatar';
import { Loader } from '../../components/Loader';
import { TimelineFeed } from '../../components/TimelineFeed';

export default function Profile() {
  const { slug } = useParams();
  const { user } = useAuth();
  const username = slug || user?.username;
  const { data: profile, isLoading } = useUser(username);
  const { data: contacts } = useUserContacts(profile?.id);
  const { data: timeline } = useUserTimeline(profile?.id);

  if (isLoading) return <Loader />;
  if (!profile) return <div className="p-8 text-center text-slate-500">User not found.</div>;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-6 lg:grid-cols-[280px_1fr]" data-testid="profile">
      <aside className="card p-5 text-center">
        <Avatar user={profile} size={96} className="mx-auto" />
        <h1 className="mt-3 text-lg font-semibold text-slate-800">{profile.full_name_display || profile.username}</h1>
        <p className="text-sm text-slate-500">@{profile.username}</p>
        {profile.bio && <p className="mt-3 text-sm text-slate-500">{profile.bio}</p>}
        {contacts && contacts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase text-slate-400">Contacts</h3>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {contacts.map((c) => (
                <Avatar key={c.id} user={c} size={28} />
              ))}
            </div>
          </div>
        )}
      </aside>
      <section>
        <h2 className="text-lg font-semibold">Activity</h2>
        <div className="mt-3">
          {timeline && timeline.length ? <TimelineFeed entries={timeline} /> : <p className="text-sm text-slate-500">No activity yet.</p>}
        </div>
      </section>
    </div>
  );
}
