export function LoadingTablePlaceholder({ rows, columns }: { rows: number; columns: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid animate-pulse gap-4 rounded-md border bg-muted/30 p-4"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 rounded bg-muted" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LoadingListPlaceholder({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
        >
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-8 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
