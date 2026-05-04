export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center p-10 text-taiga-grey-light">
      <span className="inline-block h-3 w-3 mr-3 rounded-full bg-taiga-green-dark animate-pulse" />
      {label}
    </div>
  );
}
