"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  /** Uppercase mono label, matching the wizard's and the booking form's fields. */
  micro?: boolean;
};

const INPUT =
  "min-h-[46px] w-full rounded-control border border-border bg-page px-[13px] py-3 text-[14px] text-ink transition-colors duration-150 placeholder:text-ink-400 hover:border-border-strong";

export function TextField({ label, error, micro, id, type, ...input }: Props) {
  const t = useTranslations("common");
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === "password";

  return (
    <div>
      <label
        htmlFor={id}
        className={
          micro
            ? "micro-label mb-2 block text-[10.5px] text-ink-500"
            : "mb-[7px] block text-[12.5px] font-semibold text-[#334155]"
        }
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={isPassword ? `${INPUT} pr-11` : INPUT}
          {...input}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? t("hidePassword") : t("showPassword")}
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center rounded-control px-[13px] text-ink-500 transition-colors duration-150 hover:text-ink"
          >
            {revealed ? (
              <EyeOff className="size-[18px]" aria-hidden="true" />
            ) : (
              <Eye className="size-[18px]" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-[6px] text-[12px] text-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
}
