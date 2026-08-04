"use client";

import { useEffect, useState } from "react";

const CONTROL =
  "min-h-[48px] w-full min-w-0 rounded-control border border-border-strong bg-surface px-[13px] py-3 text-[14px] text-ink transition-colors duration-150 hover:border-blue";

// The spec stores numbers, but a controlled numeric input has to hold the raw
// string or it swallows a trailing decimal point as the user types it.
export function NumberInput({
  value,
  onCommit,
  className = "",
  ...input
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number;
  onCommit: (next: number) => void;
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
      className={`${CONTROL} ${className}`}
      {...input}
    />
  );
}
