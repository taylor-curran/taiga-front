export type AdminPlaceholderPageProps = {
  title: string;
};

export function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <>
      <header>
        <h1>{title}</h1>
        <p className="taiga-admin-subtitle" data-testid="admin-placeholder-message">
          Port pending — this is the admin feature page for &quot;{title}&quot;. No API calls or forms yet.
        </p>
      </header>
    </>
  );
}
