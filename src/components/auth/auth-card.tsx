"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { TextField } from "@/components/ui/text-field";

type Mode = "login" | "signup";
type FieldError = { message: string; field?: string };

export function AuthCard({ mode }: { mode: Mode }) {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const [error, setError] = useState<FieldError | null>(null);
  const [pending, setPending] = useState(false);

  const isSignup = mode === "signup";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(
      [...form.entries()].filter(([, v]) => v !== "")
    );

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? { message: tc("genericError") });
      setPending(false);
      return;
    }

    // refresh() so the server components re-render against the new session
    // before the dashboard paints.
    router.replace("/dashboard");
    router.refresh();
  }

  const tab = (target: Mode, label: string) => (
    <Link
      href={target === "login" ? "/login" : "/signup"}
      className={`flex min-h-[42px] flex-1 cursor-pointer items-center justify-center rounded-[8px] text-[13.5px] font-semibold transition-colors duration-150 ${
        mode === target
          ? "bg-surface text-navy shadow-[0_1px_2px_rgba(15,23,42,.08)]"
          : "text-ink-500 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-[404px] rounded-card bg-surface p-[26px] shadow-[0_4px_24px_rgba(15,23,42,.06)]">
        <div className="mb-6 flex gap-0 rounded-[10px] bg-[#EEF2F7] p-1">
          {tab("login", t("signIn"))}
          {tab("signup", t("createAccount"))}
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          {isSignup && (
            <>
              <TextField
                id="company"
                name="company"
                label={t("companyLabel")}
                placeholder="Nazarov Trading LLC"
                autoComplete="organization"
                required
                error={error?.field === "company" ? error.message : undefined}
              />
              <TextField
                id="phone"
                name="phone"
                type="tel"
                label={t("phone")}
                placeholder="+998 90 123 4567"
                autoComplete="tel"
                error={error?.field === "phone" ? error.message : undefined}
              />
            </>
          )}

          <TextField
            id="email"
            name="email"
            type="email"
            label={t("businessEmail")}
            placeholder="alisher@company.uz"
            autoComplete="email"
            required
            error={error?.field === "email" ? error.message : undefined}
          />

          <div>
            <TextField
              id="password"
              name="password"
              type="password"
              label={t("password")}
              placeholder="••••••••"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              error={error?.field === "password" ? error.message : undefined}
            />
            {/* Inert, as in the comp — password reset is not in this release. */}
            {!isSignup && (
              <div className="mt-[9px] flex justify-end">
                <a
                  href="#"
                  className="cursor-pointer text-[12.5px] font-semibold text-blue hover:text-blue-hover"
                >
                  {t("forgotPassword")}
                </a>
              </div>
            )}
          </div>

          {error && !error.field && (
            <p role="alert" className="text-[12.5px] text-danger-ink">
              {error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="min-h-[50px] w-full cursor-pointer rounded-control bg-navy p-[14px] text-[14.5px] font-semibold text-white transition-colors duration-150 hover:bg-navy-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSignup ? t("createAccount") : t("signInCta")}
          </button>
        </form>

        <div className="mt-[22px] flex items-center gap-[14px]">
          <div className="h-px flex-1 bg-border" />
          <span className="whitespace-nowrap text-[12px] text-ink-500">
            {t("orCalc")}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Link
          href="/"
          className="mt-[18px] flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-border bg-surface p-[13px] text-center text-[14px] font-semibold text-[#334155] transition-colors duration-150 hover:bg-page"
        >
          {t("calcWithoutAccount")}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>

        <p className="mt-5 text-center text-[12.5px] text-ink-500">
          {isSignup ? t("haveAccount") : t("newHere")}{" "}
          <Link
            href={isSignup ? "/login" : "/signup"}
            className="cursor-pointer font-semibold text-blue hover:text-blue-hover"
          >
            {isSignup ? t("signInInstead") : t("createFree")}
          </Link>
        </p>
      </div>

      <p className="mt-[22px] max-w-[404px] text-center text-[12px] leading-normal text-ink-500">
        {t("termsPrefix")}{" "}
        <a href="#" className="cursor-pointer underline">
          {t("termsOfService")}
        </a>{" "}
        {t("and")}{" "}
        <a href="#" className="cursor-pointer underline">
          {t("privacyPolicy")}
        </a>
      </p>
    </div>
  );
}
