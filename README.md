# Aditya Paruchuri - Portfolio

A modern, interactive portfolio website featuring a binary matrix spotlight background. Built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Binary Matrix Background** - Canvas-rendered grid of 0s and 1s with a cursor-tracking spotlight effect
- **Interactive Skill Tiles** - 3D tilt effect with neighbor influence on hover
- **Glassmorphism UI** - Frosted glass effects throughout
- **Smooth Animations** - Framer Motion scroll-in and stagger animations
- **Responsive** - Works on desktop, tablet, and mobile
- **Sections**: Hero, About, Projects, Contact

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Graphics**: HTML5 Canvas
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Deployment

Deployed on **Cloudflare Workers** via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) (chosen to run the upcoming "virtual me" avatar feature's backend on Workers AI/KV).

```bash
npm run preview   # build + serve locally on the real Workers runtime (wrangler dev)
npm run deploy    # build + publish to production
```

Bindings (Workers AI, KV, static assets) are declared in `wrangler.jsonc`. Requires `wrangler login` once per machine.

## Project Structure

```
portfolio-v2/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page (composes all sections)
│   └── globals.css         # Global styles and CSS variables
├── components/
│   ├── SpotlightGrid.tsx   # Binary matrix canvas background
│   ├── Navigation.tsx      # Fixed top navigation
│   ├── Hero.tsx            # Landing section
│   ├── About.tsx           # About + skills section
│   ├── Projects.tsx        # Project showcase
│   └── Contact.tsx         # Contact form + footer
├── public/images/          # Static assets
├── tailwind.config.ts      # Tailwind configuration
└── package.json            # Dependencies
```

## License

MIT
