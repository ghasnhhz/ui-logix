# U Logix — Design System (Master)

Source of truth for colour, typography, spacing, and component shape.

Hand-written from the PM's comps in `design/`. **Do not regenerate this file with
`ui-ux-pro-max --design-system`** — that command invents a palette from the
product category and will contradict everything below.

Page-specific deviations go in `design-system/pages/<page>.md`. When building a
page, read that file first; fall back to this one.

---

## 1. Colour

### Brand

| Token | Hex | Use |
|-------|-----|-----|
| `navy` | `#16233F` | sidebar, dark buttons, logo wordmark |
| `navy-hover` | `#1E2E52` | sidebar item hover |
| `navy-active` | `#24365C` | sidebar item active, sidebar borders |
| `navy-muted` | `#8FA0BF` | sidebar secondary text |
| `navy-dim` | `#6B7C9E` | sidebar section labels |
| `amber` | `#F5A623` | primary CTA, best-value ribbon, "NEW" badge |
| `amber-ink` | `#3B2600` | text on amber |
| `blue` | `#2563EB` | links, active step, focus ring, selected state |
| `blue-hover` | `#1D4ED8` | link hover |

Amber is the conversion colour. It marks the primary action on the landing CTA,
the gate CTA, the final wizard step, and the best-value quote — nowhere else.
Blue is for navigation and selection. One amber action per screen.

### Neutral

| Token | Hex | Use |
|-------|-----|-----|
| `ink` | `#0F172A` | primary text |
| `ink-600` | `#475569` | secondary text |
| `ink-500` | `#64748B` | tertiary text |
| `ink-400` | `#94A3B8` | disabled, placeholder |
| `border` | `#E2E8F0` | default border |
| `border-strong` | `#CBD5E1` | emphasised border, scrollbar |
| `surface` | `#FFFFFF` | cards |
| `page` | `#F8FAFC` | page background |
| `page-alt` | `#F1F5F9` | app shell background, inactive tab track |

### Semantic

| Meaning | Fill | Text | Use |
|---------|------|------|-----|
| success | `#D1FAE5` | `#047857` | below market, delivered, KPI deltas |
| success-solid | `#10B981` | — | completed wizard step |
| warning | `#FFFBEB` | `#D97706` | pending pill, on the `#FFFBEB` fill |
| warning-strong | — | `#B45309` | above-market flag — warning text on white |
| danger | `#FEE2E2` | `#DC2626` | expired, errors |
| info | `#EFF6FF` | `#2563EB` | active filter, selected card background `#F5F9FF` |

`#D97706` reaches only 3.4:1 on white, so the above-market flag — which sits on a
white quote card, not on the amber fill — uses `#B45309` (4.9:1). Same reasoning
as the three greys raised in § 1 Neutral.

### Transport mode chips

| Mode | Fill | Text |
|------|------|------|
| AIR | `#DBEAFE` | `#1D4ED8` |
| LTL | `#EDE9FE` | `#6D28D9` |
| FTL | `#D1FAE5` | `#047857` |
| FCL | `#CFFAFE` | `#0E7490` |
| ALL | `#F1F5F9` | `#475569` |

### Carrier brand marks

Logo chip background per carrier. Text is always white.

| Carrier | Hex |
|---------|-----|
| Maersk Line | `#1D4ED8` |
| DB Schenker | `#DC2626` |
| FedEx Freight | `#6D28D9` |
| DHL Express | `#F5A623` |
| Kuehne + Nagel | `#0E7490` |
| CMA CGM | `#0F766E` |

---

## 2. Typography

Three families, loaded from Google Fonts. Cyrillic coverage is mandatory —
Russian is a launch locale.

- **Plus Jakarta Sans** (400, 500, 600, 700) — everything by default.
  Subsets `latin, latin-ext`.
- **Manrope** (400, 500, 600, 700) — Cyrillic understudy. Never selected
  directly; it is reached only by fallback. Subsets `latin, cyrillic`.
- **IBM Plex Mono** (400, 500, 600) — uppercase micro-labels, field labels,
  reference numbers, and the "FREIGHT PLATFORM" tagline.
  Subsets `latin, latin-ext, cyrillic`.

Plus Jakarta Sans has no `cyrillic` subset on Google Fonts. It offers
`cyrillic-ext`, which covers historic and minority-language characters but not
the basic Russian alphabet at U+0400–045F. Requesting `cyrillic` from
`next/font` is a build error; shipping without it drops every Russian string to
a system font.

So `--font-sans` is a stack, not a single family: Jakarta first, Manrope behind
it. Latin renders in Jakarta, Cyrillic falls through to Manrope, and the two are
close enough in geometry that a mixed-script line still reads as one typeface.
Do not collapse this to one family. IBM Plex Mono has real Cyrillic and needs no
understudy.

The mono/uppercase/wide-tracking treatment is the product's signature. Use it for
field labels above inputs (`ORIGIN`, `TOTAL WEIGHT`, `SORT BY`) and for section
eyebrows. Never for body copy.

| Role | Size | Weight | Notes |
|------|------|--------|-------|
| Hero headline | 40–48px | 700 | landing only |
| Page title | 22px | 700 | |
| Section heading | 15–16px | 700 | |
| Body | 13.5–14px | 400 | |
| Secondary body | 12.5–13px | 400 | `ink-500` |
| Micro-label | 9.5–11px | 500–700 | IBM Plex Mono, uppercase, `letter-spacing: 0.14em` |
| KPI value | 26–28px | 700 | |
| Price | 20–24px | 700 | amber when best value |

---

## 3. Spacing, radius, motion

- Spacing scale: 4 / 6 / 8 / 11 / 12 / 16 / 18 / 22 / 24 / 34px.
- Radius: `4px` chips · `9px` buttons and inputs · `12px` cards · `9999px` pills.
- Sidebar width `200px`, sticky, full viewport height.
- Content padding: `30px 34px` on landing and auth, `22px 24px 56px` in-app.
- Wizard max width `900px`.
- Focus ring: `border-color: #2563EB` plus `box-shadow: 0 0 0 3px rgba(37,99,235,.12)`.
- Entry animation: `opacity 0 → 1`, `translateY(8px) → 0`, ~200ms.
- Toasts auto-dismiss at 2600ms (web) / 2400ms (mobile).
- Simulated rate fetch: 1600ms with a spinner, then results. Keep it — it makes
  the "querying six carriers" claim legible.

---

## 4. Icons

**Lucide only. Never emoji.**

The PM's comps use emoji as icons. Emoji render inconsistently across Windows,
Android, and iOS, so the mode selector and cargo picker would look different for
every user. Replace on sight using this mapping:

| Comp | Lucide | Where |
|------|--------|-------|
| 🚚 | `Truck` | logo mark, KPI |
| ✈️ | `Plane` | AIR mode |
| 🚛 | `Truck` | LTL mode |
| 🏭 | `Factory` | FTL mode |
| 🚢 | `Ship` | FCL mode |
| 🧵 | `Shirt` | textiles |
| ⚙️ | `Cog` | machinery |
| 💻 | `Laptop` | electronics |
| 🌾 | `Wheat` | food and agriculture |
| 🪑 | `Armchair` | furniture |
| 📦 | `Package` | other cargo, KPI |
| 📄 | `FileText` | quotes KPI |
| 📈 | `TrendingUp` | savings KPI |
| 💲 | `DollarSign` | spend KPI |
| 📍 | `MapPin` | origin |
| 🏁 | `Flag` | destination |
| 📅 | `Calendar` | ship date |
| 🏷️ | `Tag` | freight class |
| ⚖️ | `Scale` | weight |
| 📐 | `Ruler` | dimensions |
| ⚡ | `Zap` | hero feature |
| 📊 | `BarChart3` | hero feature |
| ★ | `Star` | carrier rating |
| 🕐 | `Clock` | transit days on a mode card |
| ⇅ | `ArrowUpDown` | swap origin and destination |
| ✓ | `Check` | assurance lines, completed step, gate benefits |
| 🔒 | `Lock` | gate eyebrow, guest notice |
| 🔍 | `Search` | results empty state |
| ⏻ | `Power` | sidebar log out |
| ▦ | `LayoutDashboard` | sidebar Dashboard |
| ▯ | `FilePlus` | sidebar New Quote |
| ▭ | `Archive` | sidebar My Cabinet |
| + | `Plus` | topbar Get Quote |
| ‹ › | `ChevronLeft` / `ChevronRight` | back links, book action |
| 💡 | `Lightbulb` | dashboard save tip |
| ⬇ | `Download` | cabinet CSV export |
| ↓ ↑ | `TrendingDown` / `TrendingUp` | savings KPI delta direction |

The comp draws the sidebar's three nav glyphs and the results star rating as CSS
boxes and `★★★★☆` text respectively. Both become Lucide: five `Star`s with the
first `round(rating)` filled, and the three icons above.

Inline icons 16–20px, decorative icons 24px maximum. Decorative icons get
`aria-hidden="true"`; icon-only buttons get `aria-label`.

---

## 5. Components

**Card** — white, `1px solid #E2E8F0`, radius 12px, padding 16–20px. Selected
state: `1.5px solid #2563EB` on `#F5F9FF`.

**Primary button** — amber fill, `amber-ink` text, radius 9px, padding 11–14px,
weight 600.

**Secondary button** — navy fill, white text, same geometry.

**Input** — `1px solid #E2E8F0`, radius 9px, padding 10–12px, with a mono
uppercase micro-label above.

**Selectable option card** (transport mode, cargo type) — full-width card, icon
left, title and description centre, radio dot right. Selected gets the blue
border, tinted background, and a 5px-thick radio dot.

**Quote card** — carrier chip left, name, star rating, review count and on-time
percentage, all-in price right. Best value gets an amber border, an amber ribbon
reading "BEST VALUE · LOWEST ALL-IN COST", amber price, and an amber Book button.
Cost breakdown sits in a four-column row: base rate, fuel surcharge, insurance,
transit.

**Stepper** — five nodes. Completed `#10B981` with a check, current `#2563EB`,
upcoming `#E2E8F0`. Connector line takes the completed colour.

**Status pill** — text only, no fill. Quoted and booked and in-transit blue,
pending amber, delivered green, expired red.

**Toast** — bottom-centre, dark navy, white text, auto-dismiss.

---

## 6. Pre-delivery checklist

Run before every UI pull request.

- [ ] No emoji used as an icon anywhere
- [ ] `cursor-pointer` on every clickable element
- [ ] Hover states on all interactive elements, 150–300ms transition
- [ ] Visible focus states for keyboard navigation
- [ ] Text contrast at least 4.5:1
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at 375 / 768 / 1024 / 1440px
- [ ] Every string localised in `en`, `uz`, and `ru`
- [ ] Russian and Uzbek strings do not overflow their containers — Cyrillic runs
      roughly 15% longer than English, and Uzbek compounds are longer still
- [ ] Form fields have associated labels
- [ ] Loading and empty states exist for every data view

---

## 7. Anti-patterns

Do not introduce:

- Dark mode. Out of scope for Phase 1.
- Gradients, glassmorphism, or decorative shadows. The product is flat and
  utilitarian — a freight buyer is comparing numbers, not admiring a page.
- More than one amber action per screen.
- Purple or pink AI-style accents. This is a logistics tool.
- Fake precision. Prices round to whole dollars, never cents.
- Carousels or auto-advancing content.
