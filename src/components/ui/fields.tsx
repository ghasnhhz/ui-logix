const CONTROL =
  "min-h-[48px] w-full rounded-control border border-border-strong bg-surface px-[13px] py-3 text-[14px] text-ink transition-colors duration-150 placeholder:text-ink-400 hover:border-blue";

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="micro-label mb-2 block text-[10.5px] text-ink-500"
    >
      {children}
    </label>
  );
}

type Option = { value: string; label: string };

export function SelectField({
  id,
  label,
  options,
  className,
  ...select
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  options: readonly Option[];
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select id={id} className={`${CONTROL} cursor-pointer`} {...select}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function NumberField({
  id,
  label,
  className,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input id={id} type="number" inputMode="decimal" className={CONTROL} {...input} />
    </div>
  );
}

export function DateField({
  id,
  label,
  className,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input id={id} type="date" className={`${CONTROL} cursor-pointer`} {...input} />
    </div>
  );
}

export function TextareaField({
  id,
  label,
  className,
  ...textarea
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea id={id} rows={3} className={`${CONTROL} resize-y`} {...textarea} />
    </div>
  );
}
