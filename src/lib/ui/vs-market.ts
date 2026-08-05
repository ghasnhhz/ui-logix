// The benchmark is cross-mode (D-036), so an ocean-heavy month lands well under
// market and an air-heavy one lands over it. The figure is signed either way and
// the colour is what tells a shipper which side of market they came out on.
// Zero is left in ink — it means no bookings, not a result.
export function vsMarketTone(saving: number) {
  if (saving > 0) return "text-success-ink";
  if (saving < 0) return "text-warning-ink-strong";
  return "";
}
