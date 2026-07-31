import { useParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useUserBySlug } from '@/services/users';
import { Avatar } from '@/components/common/Avatar';
import { Loading } from '@/components/common/Loading';
import { Empty } from '@/components/common/Empty';

export function ProfilePage() {
  const { slug } = useParams();
  const me = useAuth((s) => s.user);
  const { data, isLoading } = useUserBySlug(slug);
  const user = slug ? data : me;

  if (isLoading) return <Loading />;
  if (!user) return <Empty title="User not found" />;

  return (
    <article className="card p-6">
      <div className="flex items-center gap-4">
        <Avatar
          name={user.full_name_display || user.full_name || user.username}
          src={user.photo}
          size={72}
        />
        <div>
          <h1 className="text-2xl font-semibold">
            {user.full_name_display || user.full_name || user.username}
          </h1>
          <p className="text-taiga-grey-light">@{user.username}</p>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {user.email && (
          <div>
            <dt className="text-taiga-grey-light">Email</dt>
            <dd>{user.email}</dd>
          </div>
        )}
        <div>
          <dt className="text-taiga-grey-light">Public projects</dt>
          <dd>{user.total_public_projects ?? 0}</dd>
        </div>
        <div>
          <dt className="text-taiga-grey-light">Private projects</dt>
          <dd>{user.total_private_projects ?? 0}</dd>
        </div>
        {user.lang && (
          <div>
            <dt className="text-taiga-grey-light">Language</dt>
            <dd>{user.lang}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}
