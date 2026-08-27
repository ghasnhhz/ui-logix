"use client";

import { useTranslations } from "next-intl";
import { fieldError, type FormError } from "@/lib/ui/form-error";
import { useTmaApp } from "../app-provider";
import { FIELD, MicroLabel } from "../fields";

/**
 * The sheet's inputs. The comp renders company and phone in both modes; the
 * email is booking's alone, because signup has nowhere to send anything yet.
 */
export function ContactFields({
  shown,
  withEmail = false,
}: {
  shown: FormError | null;
  withEmail?: boolean;
}) {
  const { state, dispatch } = useTmaApp();
  const t = useTranslations("tma.gate");

  return (
    <div className="mt-3 flex flex-col gap-3">
      <Field
        name="company"
        label={t("companyLabel")}
        placeholder="Nazarov Trading LLC"
        autoComplete="organization"
        value={state.gateForm.company}
        error={fieldError(shown, "company")}
        onChange={(company) => dispatch({ type: "patchGate", patch: { company } })}
      />

      <Field
        name="phone"
        type="tel"
        label={t("phone")}
        placeholder="+998 90 123 4567"
        autoComplete="tel"
        value={state.gateForm.phone}
        error={fieldError(shown, "phone")}
        onChange={(phone) => dispatch({ type: "patchGate", patch: { phone } })}
      />

      {/* Left blank the booking copies the account's synthetic address (D-054),
          which can never receive anything — so this is the one chance to put a
          real inbox on the confirmation. */}
      {withEmail && (
        <Field
          name="email"
          type="email"
          label={t("emailLabel")}
          placeholder="alisher@nazarov.uz"
          autoComplete="email"
          hint={t("emailHint")}
          value={state.gateForm.email}
          error={fieldError(shown, "email")}
          onChange={(email) => dispatch({ type: "patchGate", patch: { email } })}
        />
      )}
    </div>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  placeholder,
  autoComplete,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const id = `tma-gate-${name}`;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div>
      <MicroLabel htmlFor={id}>{label}</MicroLabel>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-describedby={hintId}
        aria-invalid={error ? true : undefined}
        className={FIELD}
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-[10.5px] leading-[1.45] text-ink-400">
          {hint}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-[11.5px] text-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
}
