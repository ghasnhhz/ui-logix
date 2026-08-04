"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { TextareaField } from "@/components/ui/fields";
import { Spinner } from "@/components/ui/spinner";
import { TextField } from "@/components/ui/text-field";
import type { Quote } from "@/lib/pricing";
import { isError, post, type ApiError } from "@/lib/ui/api-client";
import { fieldError, resolveError } from "@/lib/ui/form-error";
import { SelectionSummary } from "./selection-summary";

const FIELDS = ["contactName", "company", "email", "phone", "taxId", "notes"] as const;

const FORM_ID = "booking-form";

export type BookingAccount = { company: string; email: string; phone: string };

export function BookingView({
  quote,
  quoteId,
  account,
  backHref,
}: {
  quote: Quote;
  quoteId: string;
  account: BookingAccount;
  backHref: string;
}) {
  const t = useTranslations("booking");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const router = useRouter();
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, setPending] = useState(false);

  const shown = resolveError(error, { fields: FIELDS, t: te, foreign: te("invalid") });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const contact = Object.fromEntries([...form.entries()].filter(([, v]) => v !== ""));

    // The carrier and mode go up as identifiers only — the price is read server
    // side off the stored quote, so a tampered body cannot change what is booked.
    const booking = await post<{ reference: string }>(
      "/api/bookings",
      { ...contact, quoteId, carrierId: quote.carrierId, mode: quote.mode },
      tc("genericError"),
    );

    if (isError(booking)) {
      setError(booking.error);
      setPending(false);
      return;
    }

    router.replace(`/confirmed?ref=${booking.data.reference}`);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <Link
        href={backHref}
        className="flex w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-semibold text-ink-500 transition-colors duration-150 hover:text-blue"
      >
        <ChevronLeft className="size-[14px]" aria-hidden="true" />
        {t("backToResults")}
      </Link>
      <h1 className="mt-[10px] text-pretty text-[24px] font-bold tracking-[-0.03em]">
        {t("confirmBooking")}
      </h1>
      <p className="mt-[5px] text-pretty text-[13px] text-ink-500">{t("confirmSub")}</p>

      <div className="mt-[18px] grid items-start gap-[18px] lg:grid-cols-[1fr_360px]">
        <section className="rounded-card border border-border bg-surface p-[18px] shadow-[0_1px_2px_rgba(15,23,42,.04)]">
          <h2 className="text-[15px] font-bold">{t("contactDetails")}</h2>

          <form id={FORM_ID} onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
            {/* The account has no person's name, so this one field starts empty
                while the rest arrive prefilled and editable. */}
            <TextField
              micro
              id="booking-contact"
              name="contactName"
              label={t("contactName")}
              placeholder="Alisher Nazarov"
              autoComplete="name"
              required
              error={fieldError(shown, "contactName")}
            />
            <TextField
              micro
              id="booking-company"
              name="company"
              label={t("companyName")}
              defaultValue={account.company}
              autoComplete="organization"
              required
              error={fieldError(shown, "company")}
            />
            <TextField
              micro
              id="booking-email"
              name="email"
              type="email"
              label={t("emailAddress")}
              defaultValue={account.email}
              autoComplete="email"
              required
              error={fieldError(shown, "email")}
            />
            <TextField
              micro
              id="booking-phone"
              name="phone"
              type="tel"
              label={t("phoneNumber")}
              defaultValue={account.phone}
              placeholder="+998 90 123 4567"
              autoComplete="tel"
              required
              error={fieldError(shown, "phone")}
            />
            <TextField
              micro
              id="booking-tax"
              name="taxId"
              label={t("taxId")}
              autoComplete="off"
              error={fieldError(shown, "taxId")}
            />
            <TextareaField
              id="booking-notes"
              name="notes"
              label={t("specialInstructions")}
              placeholder={t("specialPh")}
              className="sm:col-span-2"
              error={fieldError(shown, "notes")}
            />
          </form>
        </section>

        <SelectionSummary quote={quote}>
          {shown && !shown.field && (
            <p role="alert" className="mb-3 text-[12.5px] text-danger-ink">
              {shown.message}
            </p>
          )}

          <button
            type="submit"
            form={FORM_ID}
            disabled={pending}
            className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-[10px] rounded-control bg-amber px-5 text-[14px] font-semibold text-amber-ink transition-[filter] duration-150 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending && <Spinner />}
            {t("confirmBooking")}
          </button>

          <p className="mt-3 text-pretty text-[11.5px] leading-relaxed text-ink-500">
            {t("finePrint")}
          </p>
        </SelectionSummary>
      </div>
    </div>
  );
}
