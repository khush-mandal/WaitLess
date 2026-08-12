# WaitLess
WaitLess -  know the crowd. Predict the wait. Choose better 


# WaitLess — UI/UX Design System & Prototype

Real-time crowd intelligence app. Know the crowd. Predict the wait. Choose better.

This repo contains a **clickable HTML/CSS/JS prototype** (no build step, no dependencies) covering only the **MUST-have** features for the college round: one-tap crowd report, live crowd list, estimated wait, best-time recommendation, smart alternative, and confidence score.

## View it

**Locally:** open `index.html` in any browser.

**On GitHub Pages:**
1. Push this repo to GitHub.
2. Go to `Settings → Pages → Deploy from a branch`, pick `main` and `/root`.
3. Your live design system + prototype will be at `https://<username>.github.io/<repo>/`.

## Structure

```
waitless-uiux/
├── index.html          # Design system page + clickable prototype
├── css/style.css        # All design tokens & component styles
├── js/app.js             # Screen-switching logic for the prototype
├── assets/logo.svg       # Logo mark (light/dark/lockup all built from this one file)
└── README.md
```

## Brand

**Logo:** an hourglass built from two triangles, crossed by a live pulse line — reads as "time" and "live data" at once. The lower triangle is a lighter tint, like sand running low. Works as a single icon or a horizontal lockup with the wordmark.

**Colour system**

| Token | Hex | Use |
|---|---|---|
| Ink | `#181233` | Dark surfaces, primary text on light |
| Violet | `#6C3CE9` | Primary brand, CTAs |
| Violet 600 | `#4B2AAD` | Gradients, pressed states |
| Pulse Cyan | `#12D6C4` | Live indicators, accents |
| Mist | `#F6F5FB` | App background |
| Crowd — Low | `#22B573` | Fixed meaning everywhere |
| Crowd — Medium | `#F5A623` | Fixed meaning everywhere |
| Crowd — High | `#E5484D` | Fixed meaning everywhere |

Crowd colours never change role — green/amber/red mean the same thing on every screen, in every component.

**Typography**
- `Space Grotesk` (600) — display / headings / logo wordmark
- `Inter` (400–600) — all body copy and UI text
- `JetBrains Mono` (500) — anything measured: wait ranges, confidence %, timestamps

## Screens in the prototype

1. **Splash** — logo, tagline, entry point
2. **Home** — search + 4 sector categories (hospitality, finance, retail, entertainment) + nearby preview
3. **Nearby list** — every card shows crowd badge + wait + confidence + "updated Xm ago"
4. **Place details** — estimated wait range, confidence, best-time-today, smart lower-wait alternative, one-tap report CTA
5. **Report crowd** — single-tap Low / Medium / High bottom sheet; submitting shows a live toast update on the nearby list

## Design rule this system enforces

Every place, on every screen, always shows **crowd level + estimated wait + confidence** together — never estimated wait in isolation. This is the one rule the whole UI is built around.

## Out of scope (by design)

Login/signup, points/badges/leaderboard, business dashboard, notifications, and full map view are intentionally not built — this prototype covers only the features marked `MUST` for the college selection round.
