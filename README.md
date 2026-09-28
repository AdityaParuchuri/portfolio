# Aditya Paruchuri - Portfolio

A modern, interactive portfolio website featuring a binary matrix spotlight background and "Virtual Me" — an AI chat avatar backed by Cloudflare Workers AI. Built with Next.js 15, TypeScript, Tailwind CSS, and Framer Motion, and deployed to Cloudflare Workers.

## Features

- **Binary Matrix Background** - Canvas-rendered grid of 0s and 1s with a cursor-tracking spotlight effect, theme-aware
- **Light & Dark Mode** - Header toggle; theme persists across visits with no flash on load
- **Virtual Me Chat** - A chat avatar that answers questions about my background, grounded in a persona/timeline and streamed from Workers AI, with rate limiting and turn logging
- **Interactive Skill Tiles** - 3D tilt effect with neighbor influence on hover
- **Glassmorphism UI** - Frosted glass effects throughout
- **Smooth Animations** - Framer Motion scroll-in and stagger animations
- **Responsive** - Works on desktop, tablet, and mobile
- **Sections**: Hero, About, Projects, Contact

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Graphics**: HTML5 Canvas
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI / Backend**: Cloudflare Workers AI (chat, text-to-speech, transcription), KV (rate limiting), D1 (chat logging)
- **Testing**: Vitest with `@cloudflare/vitest-pool-workers` (runs against the real Workers runtime)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Local Worker bindings (AI, KV, D1) still resolve while running `next dev`, so Virtual Me works out of the box. Secrets go in a git-ignored `.dev.vars` file at the project root.

## Build for Production

```bash
npm run build
npm start
```

## Testing

```bash
npm test
```

Runs an OpenNext build first, then the Vitest suite against a real Workers runtime (D1 migrations are applied automatically). Avoid running this while `npm run dev` is up against the same local state — build it separately, or restart `dev` afterward.

## Deployment

Deployed on **Cloudflare Workers** via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) (chosen to run the "Virtual Me" avatar feature's backend on Workers AI/KV/D1 alongside the site).

```bash
npm run preview   # build + serve locally on the real Workers runtime (wrangler dev)
npm run deploy    # build + publish to production
```

Bindings (Workers AI, KV, D1, static assets) are declared in `wrangler.jsonc`. Requires `wrangler login` once per machine.

## Project Structure

```
portfolio-v2/
├── app/
│   ├── api/
│   │   ├── chat/route.ts       # Virtual Me chat endpoint (streamed, rate-limited, logged)
│   │   ├── speak/route.ts      # Text-to-speech (Workers AI)
│   │   └── transcribe/route.ts # Speech-to-text (Workers AI)
│   ├── layout.tsx               # Root layout, metadata, no-flash theme script
│   ├── page.tsx                 # Home page (composes all sections)
│   └── globals.css              # Global styles, light/dark theme CSS variables
├── components/
│   ├── SpotlightGrid.tsx       # Binary matrix canvas background
│   ├── Navigation.tsx          # Fixed top navigation
│   ├── ThemeToggle.tsx         # Light/dark mode switch
│   ├── Hero.tsx                # Landing section
│   ├── About.tsx               # About + timeline + skills section
│   ├── Projects.tsx            # Project showcase
│   ├── Contact.tsx             # Contact form + footer
│   └── VirtualMe/              # Chat avatar, modal, and chat hook
├── lib/
│   ├── persona.ts              # Bio + timeline data grounding Virtual Me
│   ├── aiStream.ts             # Streaming helper for Workers AI responses
│   ├── rateLimit.ts            # Per-IP hourly rate limiter (KV-backed)
│   └── chatLog.ts              # Chat turn logging to D1
├── tests/                       # Vitest suite (runs on the Workers runtime)
├── public/images/               # Static assets
├── wrangler.jsonc                # Worker bindings (AI, KV, D1, assets)
├── tailwind.config.ts            # Tailwind configuration
└── package.json                  # Dependencies
```

## License

MIT
