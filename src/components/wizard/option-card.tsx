// A real radio behind the card, so the group is arrow-key navigable and
// announced as a choice — the comp uses buttons with a decorative dot.
export function OptionCard({
  name,
  value,
  checked,
  onSelect,
  className = "",
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`cursor-pointer rounded-[11px] p-[14px] transition-colors duration-150 has-[:focus-visible]:border-blue has-[:focus-visible]:shadow-[0_0_0_3px_rgba(37,99,235,.12)] ${
        checked
          ? "border-[1.5px] border-blue bg-selected"
          : "border border-border bg-surface hover:border-blue"
      } ${className}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      {children}
    </label>
  );
}

export function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 size-[18px] flex-none rounded-full ${
        checked ? "border-[5px] border-blue" : "border-[1.5px] border-border-strong"
      }`}
    />
  );
}
