export function ListingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="listing-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-[4/3] w-full" />
          <div className="space-y-2 p-4">
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
