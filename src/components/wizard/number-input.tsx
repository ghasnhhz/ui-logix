"use client";

import { useEffect, useState } from "react";

export const NUMBER_CONTROL =
  "min-h-[48px] w-full min-w-0 rounded-control border border-border-strong bg-surface px-[13px] py-3 text-[14px] text-ink transition-colors duration-150 hover:border-blue";

// The spec stores numbers, but a controlled numeric input has to hold the raw
// string or it swallows a trailing decimal point as the user types it. That
// behaviour is the shared part: the Mini App sizes its own fields — 16px, or
// iOS zooms the webview on focus — and passes its own `control`.
export function NumberInput({
  value,
  onCommit,
  control = NUMBER_CONTROL,
  className = "",
  ...input
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number;
  onCommit: (next: number) => void;
  control?: string;
}) {
  const [raw, setRaw] = useState(() => (value === 0 ? "" : String(value)));

  useEffect(() => {
    setRaw((current) => (Number(current) === value ? current : value === 0 ? "" : String(value)));
  }, [value]);

  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      value={raw}
      onChange={(event) => {
        setRaw(event.target.value);
        const parsed = Number(event.target.value);
        onCommit(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
      }}
      className={`${control} ${className}`}
      {...input}
    />
  );
}
