// The comp draws no loading state for these two screens; results does, and this
// is the same treatment at the row's height so the list does not jump when the
// rows arrive.
export function RecordSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-[66px] animate-pulse rounded-card bg-page-alt" />
      ))}
    </div>
  );
}
