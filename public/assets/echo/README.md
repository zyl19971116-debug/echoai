# /public/assets/echo — character imagery

These two files are **drawn placeholders**, not final art. The interface is designed so real imagery
drops in without touching layout code.

| File            | Where it appears                                   | Replace with    |
| --------------- | -------------------------------------------------- | --------------- |
| `human.svg`     | Home hero — left panel (`YOU`)                      | `human.png`     |
| `ai-shadow.svg` | Home hero — right panel (`AI YOU`), `/my-echo`       | `ai-shadow.png` |

## How to replace

1. Export your images as **PNG** and drop them in this folder.
2. Update the two `src` props:
   - `components/home/HeroVisual.tsx` → `<FigurePanel src="/assets/echo/human.svg" …>` and
     `<FigurePanel src="/assets/echo/ai-shadow.svg" …>`
   - `components/echo/MyEchoView.tsx` → the large AI portrait panel
3. Nothing else needs to change. Vertical frames, glow, rings, scanline and identity plates are all
   applied by `components/shadow/FigurePanel.tsx`.

## Art direction

- **Aspect ratio 3:4** (e.g. 900 × 1200, 1200 × 1600). The container is `aspect-[3/4]`.
- Subject centred horizontally, head in the **upper 40%** — the bottom of the frame fades into the page.
- Background: near-black around `#050914`. Avoid pure black edges and busy backgrounds.
- **Human panel** — cool blue rim light (`#4C8DFF`) on one side, neutral/desaturated skin tones,
  cinematic, calm. Reference the "YOU" mood: ordinary, human, unhurried.
- **AI panel** — violet/cyan emission (`#9B6BFF`, `#3BE8FF`), holographic or wireframe treatment,
  particle accents. Reference the "AI YOU" mood: same silhouette, made of data.
- Keep the two compositions mirrored in scale so the `VS` reads as a real comparison.
- Avoid cartoon styling, heavy neon, and stock-photo framing.

## Current placeholders

The SVG placeholders share one silhouette with two treatments, deliberately — the pair reads as
"the same wallet, two lives". They are vector, so they stay sharp at any size and cost nothing to load.

## Missing images

`FigurePanel` catches image load errors and renders an inline drawn silhouette instead, so a missing or
renamed asset degrades gracefully instead of showing a broken-image icon.
