export function UserSettingsPlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <h1>{title}</h1>
      <p className="taiga-admin-subtitle" data-testid="user-settings-placeholder-message">
        Port pending — this is the user settings &quot;{title}&quot; page. No API calls yet.
      </p>
    </>
  );
}
