export function Loader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400" data-testid="loader">
      <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-taiga-200 border-t-taiga-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-slate-500" data-testid="inline-loader">
      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      Loading
    </div>
  );
}
