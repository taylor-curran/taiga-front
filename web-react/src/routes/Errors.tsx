import { Link, useParams } from 'react-router-dom';

function ErrorShell({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-12 text-center">
      <h1 className="text-4xl font-bold text-slate-700">{title}</h1>
      <p className="mt-4 max-w-md text-slate-500">{message}</p>
      <Link to="/" className="btn-primary mt-6">Go home</Link>
    </div>
  );
}

export function NotFound() {
  return <ErrorShell title="Page not found" message="The page you’re looking for doesn’t exist." />;
}

export function GenericError() {
  return <ErrorShell title="Something went wrong" message="An unexpected error occurred. Please try again." />;
}

export function PermissionDenied() {
  return <ErrorShell title="Permission denied" message="You don’t have permission to access this resource." />;
}

export function BlockedProject() {
  const { pslug } = useParams();
  return (
    <ErrorShell
      title="Project blocked"
      message={`The project ${pslug ? `"${pslug}" ` : ''}is currently blocked. Contact an administrator.`}
    />
  );
}

export function ChangeEmail() {
  const { email_token } = useParams();
  return (
    <ErrorShell title="Verifying e-mail change" message={`Your token ${email_token} is being processed.`} />
  );
}
export function VerifyEmail() {
  const { email_token } = useParams();
  return <ErrorShell title="Verifying e-mail" message={`Your token ${email_token} is being processed.`} />;
}
export function CancelAccount() {
  const { cancel_token } = useParams();
  return <ErrorShell title="Cancel account" message={`Token: ${cancel_token}`} />;
}
export function ExternalApp() {
  return (
    <ErrorShell
      title="External application authorization"
      message="This page is opened from a third-party app embed. Please return to the host application."
    />
  );
}

export function FeedbackPage() {
  return <ErrorShell title="Feedback" message="Use the feedback button in the navigation bar to report bugs." />;
}
