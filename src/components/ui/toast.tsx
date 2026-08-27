"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

// MASTER.md § 3: bottom-centre, dark navy, auto-dismiss at 2600ms. Mounted with
// the message already decided — it announces something that has happened, so it
// never needs to poll.
const DISMISS_MS = 2600;

export function Toast({
  message,
  // The Mini App raises it clear of its own tab bar, as the comp does; the web
  // has nothing at the bottom of the page to clear.
  bottomClass = "bottom-6",
}: {
  message: string;
  bottomClass?: string;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`enter fixed ${bottomClass} left-1/2 z-50 flex -translate-x-1/2 items-center gap-[9px] rounded-control bg-navy px-[18px] py-3 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,.18)]`}
    >
      <Check className="size-4 flex-none text-success-solid" aria-hidden="true" />
      {message}
    </div>
  );
}
