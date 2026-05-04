interface EmptyProps {
  title?: string;
  message?: string;
}

export function Empty({ title = 'Nothing here yet', message }: EmptyProps) {
  return (
    <div className="card p-8 text-center text-taiga-grey-light">
      <h3 className="text-lg font-semibold text-taiga-text mb-1">{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}
