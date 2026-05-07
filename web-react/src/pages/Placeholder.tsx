/**
 * Placeholder page used by the foundation router.
 *
 * Each page team will replace these stubs with the real implementation
 * (see `pages/<group>/`). The placeholder shows the route's logical name and
 * any URL parameters so we can verify routing while the migration is in flight.
 */
import { useParams } from "react-router-dom";

interface PlaceholderProps {
  title: string;
  description?: string;
}

export function Placeholder({ title, description }: PlaceholderProps) {
  const params = useParams();
  const paramEntries = Object.entries(params);

  return (
    <section className="placeholder-page">
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {paramEntries.length > 0 ? (
        <dl className="placeholder-params">
          {paramEntries.map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <p className="placeholder-note">
        This is a foundation placeholder. Page teams will replace it.
      </p>
    </section>
  );
}

export default Placeholder;
