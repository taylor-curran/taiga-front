interface TagsProps {
  tags?: ([string, string | null] | string)[] | null;
}

export function Tags({ tags }: TagsProps) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, i) => {
        const [name, color] = Array.isArray(tag) ? tag : [tag, null];
        return (
          <span
            key={`${name}-${i}`}
            className="badge"
            style={color ? { backgroundColor: color, color: '#fff' } : undefined}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}
