// The reduced-motion block in globals.css collapses the animation, so the ring
// still reads as a busy indicator without spinning.
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      className={`size-4 flex-none animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}
