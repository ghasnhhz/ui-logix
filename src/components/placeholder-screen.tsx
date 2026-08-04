// Temporary. Features 3–6 replace these screens with the real UI; this exists
// so every route in DESIGN.md resolves and the i18n wiring is provable.
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-[900px] flex-col justify-center px-6">
      <p className="micro-label text-[10px] text-ink-500">U LOGIX</p>
      <h1 className="mt-2 text-[22px] font-bold text-ink">{title}</h1>
    </main>
  );
}
