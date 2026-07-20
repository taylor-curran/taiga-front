export function SimplePlaceholderPage({ title }: { title: string }) {
  return (
    <div data-testid="simple-placeholder">
      <h1>{title}</h1>
      <p className="taiga-admin-subtitle">Port pending — placeholder only.</p>
    </div>
  );
}
