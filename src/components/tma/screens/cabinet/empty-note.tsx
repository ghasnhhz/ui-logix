// The mobile comp never renders an empty account — its seed always has rows — so
// the copy comes from the web namespaces rather than a fourth translation of the
// same two sentences. No CTA: Telegram's MainButton and the Quote tab already
// are one.
export function EmptyNote({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 text-center">
      <p className="text-pretty text-[13px] font-bold">{title}</p>
      {body && (
        <p className="mt-2 text-pretty text-[11.5px] leading-[1.55] text-ink-500">{body}</p>
      )}
    </div>
  );
}
