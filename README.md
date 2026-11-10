# Malus website

Marketing site for Malus, a University of Chicago spin-out from the Zhong Lab, and its product PULSE-Q: a fully integrated photonic quantum key distribution system for aerospace, defense, and data center networking.

## Stack

- React 19, TypeScript, Vite
- Tailwind CSS v4
- Framer Motion for scroll and interaction animation
- three.js for the live render of the pilot receiver chip
- Lenis for smooth scrolling

## Run it

```bash
npm install
npm run dev
```

Build a static site into `dist/`:

```bash
npm run build
```

The build uses relative paths (`base: './'`), so `dist/` can be served from any folder or static host.

## Layout

| Path | What it holds |
|---|---|
| `src/components/Hero.tsx` | Full-bleed hero video, headline, and CTAs |
| `src/components/Stack.tsx` | PULSE-Q product section: pinned, exploded four-layer system view |
| `src/components/Film.tsx` | Scroll-expanding macro film of the grating coupler |
| `src/components/Platform.tsx` | Platform section with the live chip render and the three units |
| `src/components/ChipCanvas.tsx`, `src/three/chipScene.ts` | Live three.js render of the receiver chip with tracking callouts |
| `src/components/Applications.tsx` | Aerospace and data center panels with photo and HUD overlays |
| `src/components/Closing.tsx` | Security model, company, contact, and footer |
| `src/components/Media.tsx` | Photo drift, looping video, and callout components |
| `public/media/` | Generated stills (WebP) and video loops (MP4) |

## Media

The photographs and video loops in `public/media/` are AI-generated concept imagery made with Higgsfield. They do not show Malus hardware and should be replaced with real photographs as they become available.

## Placeholders to replace before launch

- Contact email `hello@malus.example` in `src/components/Closing.tsx`
