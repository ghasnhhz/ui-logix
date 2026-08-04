// Passthrough. Every request is locale-prefixed, so [locale]/layout.tsx renders
// html and body — it is the only place the active locale is known.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
