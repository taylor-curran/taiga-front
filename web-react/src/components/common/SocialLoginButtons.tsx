import { getConfig } from '@/lib/config';

const OAUTH_NONCE_KEY = 'oauth_csrf_nonce';

function buildOAuthState(invitationToken?: string, next?: string): string {
  const nonce = crypto.randomUUID();
  sessionStorage.setItem(OAUTH_NONCE_KEY, nonce);
  const payload: Record<string, string> = { nonce };
  if (invitationToken) payload.invitation_token = invitationToken;
  if (next) payload.next = next;
  return JSON.stringify(payload);
}

export function verifyOAuthState(state: string | null): { valid: boolean; invitationToken?: string; next?: string } {
  const storedNonce = sessionStorage.getItem(OAUTH_NONCE_KEY);
  if (!state || !storedNonce) return { valid: false };
  try {
    const parsed = JSON.parse(state) as { nonce?: string; invitation_token?: string; next?: string };
    if (parsed.nonce === storedNonce) {
      sessionStorage.removeItem(OAUTH_NONCE_KEY);
      return { valid: true, invitationToken: parsed.invitation_token, next: parsed.next };
    }
  } catch {
    // state is not JSON — legacy or tampered
  }
  return { valid: false };
}

export function SocialLoginButtons({ invitationToken, next }: { invitationToken?: string; next?: string }) {
  const config = getConfig();
  const hasGithub = !!config.gitHubClientId;
  const hasGitlab = !!config.gitLabClientId;

  if (!hasGithub && !hasGitlab) return null;

  function handleGithubLogin() {
    const redirectUri = `${window.location.origin}/login?provider=github`;
    const params = new URLSearchParams({
      client_id: config.gitHubClientId!,
      redirect_uri: redirectUri,
      scope: 'user:email',
      state: buildOAuthState(invitationToken, next),
    });
    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  }

  function handleGitlabLogin() {
    const gitlabUrl = config.gitLabUrl || 'https://gitlab.com';
    const redirectUri = `${window.location.origin}/login?provider=gitlab`;
    const params = new URLSearchParams({
      client_id: config.gitLabClientId!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'read_user',
      state: buildOAuthState(invitationToken, next),
    });
    window.location.href = `${gitlabUrl}/oauth/authorize?${params}`;
  }

  return (
    <div className="space-y-2">
      <div className="relative flex items-center gap-3 my-4">
        <div className="flex-1 border-t border-taiga-grey-lighter" />
        <span className="text-xs text-taiga-grey-light uppercase">or sign in with</span>
        <div className="flex-1 border-t border-taiga-grey-lighter" />
      </div>
      <div className="flex gap-3">
        {hasGithub && (
          <button
            type="button"
            className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2 border border-taiga-grey-lighter rounded"
            onClick={handleGithubLogin}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </button>
        )}
        {hasGitlab && (
          <button
            type="button"
            className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2 border border-taiga-grey-lighter rounded"
            onClick={handleGitlabLogin}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
            </svg>
            GitLab
          </button>
        )}
      </div>
    </div>
  );
}
