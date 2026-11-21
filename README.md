# Compton Networks website

Marketing site for Compton Networks, a University of Chicago spin-out from the Zhong Lab and the UChicago Space Program, and its flagship product PULSE-Q: a modular QKD source and receiver terminal pair for free-space, fiber, and relay links, designed for integrated photonics.

## Stack

- React 19, TypeScript, Vite
- Tailwind CSS v4
- Framer Motion for scroll and interaction animation
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
| `src/components/Film.tsx` | Scroll-expanding chip film with the quantum networking message |
| `src/components/Network.tsx` | Why integrated photonics and why free space plus fiber |
| `src/components/TerminalPair.tsx` | PULSE-Q section: MVP targets, animated Source and Receiver signal chains with block details |
| `src/components/Applications.tsx` | Aerospace and data center panels with photo and HUD overlays |
| `src/components/Closing.tsx` | Company and footer |
| `src/components/Media.tsx` | Photo drift, looping video, and callout components |
| `public/media/` | Generated stills (WebP) and video loops (MP4) |

## Design

Colors follow the Compton Networks pitch deck: a black ground with violet (`--color-accent`) and lavender (`--color-accent-2`) accents, defined in `src/index.css`. The terminal diagrams follow Figures 6 and 7 of the PULSE-Q Master Design Compendium.

## Media

The photographs and video loops in `public/media/` are AI-generated concept imagery made with Higgsfield, with their laser light shifted from red to the deck's violet. They do not show Compton Networks hardware and should be replaced with real photographs as they become available.

## Placeholders to replace before launch

- Contact email `hello@comptonnetworks.example` in `src/site.ts`
