# Design comps

Original design handoff from the Product Manager. Tracked so the Phase 2 team has
the source material.

| File | What it is |
|------|-----------|
| `U_Logix_Web_dc.html` | Web product — landing, wizard, gate, results, booking, dashboard, cabinet |
| `U_Logix_Mobile_dc.html` | Telegram Mini App — deferred to Phase 2 |
| `support.js` | Runtime the comps depend on |
| `ios-frame.jsx` | Device bezel used to present the mobile comp |

## Reading them

These are a custom template format, not React. Markup uses `{{ }}` bindings with
`<sc-if>` and `<sc-for>` control tags; a `Component extends DCLogic` class in the
inline `<script>` holds state and computes every displayed value.

They are a reference for exact copy, spacing, and state behaviour. Don't try to
execute them or port the runtime.

Both comps carry the full English, Uzbek, and Russian string set in the `I` and
`T` objects at the top of their script blocks — the source for
`src/i18n/messages/`.

The web comp's script also contains the complete pricing model. It has been
extracted and documented; build against that documentation, not by re-reading the
comp.
