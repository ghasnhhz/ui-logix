"use client";

import { useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Spinner } from "@/components/ui/spinner";
import { TextField } from "@/components/ui/text-field";
import { isError, post, type ApiError } from "@/lib/ui/api-client";
import { createQuote } from "@/lib/ui/quote-request";
import { specToParams, type WizardSpec } from "@/lib/wizard/spec";
import { GateSummary } from "./gate-summary";

const BENEFITS = ["benefitRates", "benefitSaved", "benefitBook"] as const;

export function GateCard({ spec }: { spec: WizardSpec }) {
  const t = useTranslations("gate");
  const ta = useTranslations("auth");
  const tc = useTranslations("common");
  const tw = useTranslations("wizard");
  const router = useRouter();
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, setPending] = useState(false);

  const backHref = `/quote?${specToParams(spec, { step: "5" })}`;

  // The order is the product promise: the account exists, then the session
  // exists, then the quote is in Postgres — and only then does a price render.
  // Short-circuiting any step would let a refresh empty the cabinet.
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const account = Object.fromEntries([...form.entries()].filter(([, v]) => v !== ""));

    const signup = await post<{ id: string }>("/api/auth/signup", account, tc("genericError"));
    if (isError(signup)) {
      setError(signup.error);
      setPending(false);
      return;
    }

    const quote = await createQuote(spec, tc("genericError"));
    if (isError(quote)) {
      setError(quote.error);
      setPending(false);
      return;
    }

    router.replace(`/results?id=${quote.data.id}&welcome=1`);
    router.refresh();
  }

  return (
    <div className="w-full max-w-[404px] rounded-card bg-surface p-[26px] shadow-[0_4px_24px_rgba(15,23,42,.06)]">
      <GateSummary spec={spec} />

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          id="gate-company"
          name="company"
          label={ta("companyLabel")}
          placeholder="Nazarov Trading LLC"
          autoComplete="organization"
          required
          error={error?.field === "company" ? error.message : undefined}
        />
        <TextField
          id="gate-phone"
          name="phone"
          type="tel"
          label={ta("phone")}
          placeholder="+998 90 123 4567"
          autoComplete="tel"
          error={error?.field === "phone" ? error.message : undefined}
        />
        {/* DESIGN.md § Gate lists only company, phone and password, but an
            account needs an email to sign back in — and the comp renders the
            field too. See DECISIONS.md D-029. */}
        <TextField
          id="gate-email"
          name="email"
          type="email"
          label={ta("businessEmail")}
          placeholder="alisher@company.uz"
          autoComplete="email"
          required
          error={error?.field === "email" ? error.message : undefined}
        />
        <TextField
          id="gate-password"
          name="password"
          type="password"
          label={ta("password")}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          error={error?.field === "password" ? error.message : undefined}
        />

        {error && !error.field && (
          <p role="alert" className="text-[12.5px] text-danger-ink">
            {error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-[10px] rounded-control bg-amber p-[14px] text-[14.5px] font-semibold text-amber-ink transition-[filter] duration-150 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending && <Spinner />}
          {pending ? tw("fetching") : t("createAndSee")}
        </button>
      </form>

      <ul className="mt-[18px] flex flex-col gap-[9px]">
        {BENEFITS.map((key) => (
          <li key={key} className="flex items-start gap-[9px] text-[12.5px] leading-relaxed text-ink-600">
            <Check className="mt-[3px] size-[13px] flex-none text-success-ink" aria-hidden="true" />
            <span className="text-pretty">{t(key)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-[18px] text-center text-[12.5px] text-ink-500">
        {ta("haveAccount")}{" "}
        <Link href="/login" className="cursor-pointer font-semibold text-blue hover:text-blue-hover">
          {ta("signInInstead")}
        </Link>
      </p>

      <Link
        href={backHref}
        className="mt-[14px] flex cursor-pointer items-center justify-center gap-1 text-[12.5px] font-semibold text-ink-500 transition-colors duration-150 hover:text-ink"
      >
        <ChevronLeft className="size-[14px]" aria-hidden="true" />
        {t("keepComparing")}
      </Link>
    </div>
  );
}
