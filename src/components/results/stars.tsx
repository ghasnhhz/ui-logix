import { Star } from "lucide-react";

// The comp draws ★★★★☆ as text; MASTER.md § Icons is Lucide only. Rounded to
// whole stars, with the numeric rating beside it doing the precise work.
export function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);

  return (
    <span className="flex items-center gap-[1px]" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`size-[12px] ${n <= filled ? "fill-amber text-amber" : "text-border-strong"}`}
        />
      ))}
    </span>
  );
}
