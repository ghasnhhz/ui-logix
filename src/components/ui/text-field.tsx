type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  /** Uppercase mono label, matching the wizard's and the booking form's fields. */
  micro?: boolean;
};

export function TextField({ label, error, micro, id, ...input }: Props) {
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
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="min-h-[46px] w-full rounded-control border border-border bg-page px-[13px] py-3 text-[14px] text-ink transition-colors duration-150 placeholder:text-ink-400 hover:border-border-strong"
        {...input}
      />
      {error && (
        <p id={`${id}-error`} className="mt-[6px] text-[12px] text-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
}
