import type { Screen } from "@/lib/tma/state";

// Placeholders for Features 10–12. Deliberately identifiers rather than prose:
// nothing here is copy, so nothing here needs a translation that would be
// deleted three features from now.
const OWNER: Partial<Record<Screen, string>> = {
  home: "feature-12",
  ships: "feature-12",
  done: "feature-11",
};

export function ScaffoldScreen({ name }: { name: Screen }) {
  return (
    <div className="rounded-card border border-dashed border-border-strong bg-surface p-4 font-mono text-xs text-ink-500">
      <div className="text-ink">screen · {name}</div>
      <div className="mt-1">{OWNER[name] ?? "unowned"}</div>
    </div>
  );
}
