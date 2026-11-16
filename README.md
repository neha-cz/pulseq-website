# Malus website

Marketing site for Malus, a University of Chicago spin-out from the Zhong Lab, and its product PULSE-Q: a fully integrated photonic quantum key distribution system for aerospace, defense, and data center networking.

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
| `src/components/Stack.tsx` | PULSE-Q product section: pinned, exploded four-layer system view |
| `src/components/Platform.tsx` | Platform section with the three units |
| `src/components/Applications.tsx` | Aerospace and data center panels with photo and HUD overlays |
| `src/components/Closing.tsx` | Company, contact, and footer |
| `src/components/Media.tsx` | Photo drift, looping video, and callout components |
| `public/media/` | Generated stills (WebP) and video loops (MP4) |

## Media

The photographs and video loops in `public/media/` are AI-generated concept imagery made with Higgsfield. They do not show Malus hardware and should be replaced with real photographs as they become available.

## Placeholders to replace before launch

- Contact email `hello@malus.example` in `src/components/Closing.tsx`
