import type { WizardSpec } from "@/lib/wizard/spec";

export type SetSpec = <K extends keyof WizardSpec>(key: K, value: WizardSpec[K]) => void;

export type StepProps = { spec: WizardSpec; set: SetSpec };

// 16px, not the web's 14px: iOS zooms a Telegram webview when a smaller field
// takes focus and the layout does not zoom back out (see `src/app/tma/layout`).
export const FIELD =
  "min-h-[48px] w-full min-w-0 rounded-control border border-border-strong bg-surface px-3 py-3 text-[16px] text-ink transition-colors duration-150 hover:border-blue";

export function MicroLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="micro-label mb-[7px] block text-[10px] text-ink-500">
      {children}
    </label>
  );
}
