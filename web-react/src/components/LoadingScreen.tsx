import '../styles/loading.css';

type Props = { message?: string };

export function LoadingScreen({ message = 'Loading…' }: Props) {
  return (
    <div className="taiga-loading" data-testid="loading-screen" role="status" aria-live="polite">
      <div className="taiga-loading__spinner" aria-hidden />
      <p className="taiga-loading__text">{message}</p>
    </div>
  );
}
