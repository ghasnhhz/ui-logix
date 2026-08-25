"use client";

import type { TmaAction } from "@/lib/tma/state";
import { useTmaApp } from "../app-provider";
import { useTelegram } from "../telegram-provider";

// The comp ships a "JUMP TO A SCREEN" panel beside the phone so every state can
// be reviewed without walking the funnel. This is that panel, for the mock only
// (D-050): a real client never renders it, and Features 9–12 delete it as the
// screens they own become reachable on their own.
const JUMPS: { label: string; actions: TmaAction[] }[] = [
  { label: "w5", actions: [{ type: "goStep", step: 5 }] },
  { label: "gate", actions: [{ type: "goStep", step: 5 }, { type: "openGate" }] },
  {
    label: "results",
    actions: [{ type: "fetchStart" }, { type: "fetchDone" }],
  },
  { label: "fetching", actions: [{ type: "fetchStart" }] },
  { label: "done", actions: [{ type: "go", screen: "done" }] },
  { label: "home", actions: [{ type: "signedIn" }, { type: "go", screen: "home" }] },
  { label: "ships", actions: [{ type: "signedIn" }, { type: "go", screen: "ships" }] },
];

export function JumpBar() {
  const { mock } = useTelegram();
  const { dispatch } = useTmaApp();

  if (!mock) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-1.5 rounded-card border border-dashed border-border-strong p-2">
      {JUMPS.map(({ label, actions }) => (
        <button
          key={label}
          type="button"
          onClick={() => actions.forEach(dispatch)}
          className="cursor-pointer rounded-chip border border-border bg-surface px-2 py-1 font-mono text-[10px] text-ink-500 transition-colors duration-150 hover:text-ink"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
