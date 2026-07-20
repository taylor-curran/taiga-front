export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="taiga-loading" data-testid="loading-spinner">
      {label}
    </div>
  );
}
