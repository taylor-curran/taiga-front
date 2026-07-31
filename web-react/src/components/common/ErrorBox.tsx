interface ErrorBoxProps {
  error?: unknown;
  message?: string;
}

export function ErrorBox({ error, message }: ErrorBoxProps) {
  const text =
    message ||
    (error && typeof error === 'object' && 'message' in error
      ? String((error as { message: unknown }).message)
      : 'Something went wrong.');
  return (
    <div className="border border-taiga-red/40 bg-taiga-red/10 text-taiga-red rounded p-4">
      {text}
    </div>
  );
}
