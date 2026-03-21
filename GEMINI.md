# KTG One - Portfolio Project

## Project Overview
This project is a high-performance portfolio website for a "Top 0.01% prompt engineer" (Vertex AI). It features a narrative-driven experience ("Reverse-engineered the engine") with advanced animations, smooth scrolling, and a distinctive visual style.

**Key Features:**
- Long-form storytelling with pinned scroll sections.
- GSAP ScrollTrigger animations (optimized for 60fps).
- Smooth scrolling via Lenis.
- Geometric background and custom cursor interactions.
- Responsive design with Tailwind CSS 4.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS 4
- **Animations:** GSAP (GreenSock Animation Platform) + ScrollTrigger
- **3D/Canvas:** Three.js (react-three-fiber and react-three-drei)
- **Scroll:** Lenis
- **Deployment:** Vercel

## Getting Started

### Prerequisites
- Node.js (ensure compatibility with Next.js 16)
- npm

### Commands
| Command | Description |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Project Structure

- **`src/app/`**: Next.js App Router pages and layouts.
  - `layout.jsx`: Root layout including `ClientLayout`, `GeometricBackground`, and `CursorDot`.
  - `globals.css`: Global styles and Tailwind imports.
- **`src/components/`**: Reusable React components.
  - `GeometricBackground.jsx`: The background visual effect.
  - `CursorDot.jsx`: Custom cursor implementation.
  - `HeroSection.jsx`, `PhilosophySection.jsx`, etc.: Main page sections.
- **`src/lib/`**: Utility functions (`utils.js`, `wordpress.js`).
- **`public/assets/`**: Static assets (images, fonts, icons).
- **`CLAUDE.md` / `AGENTS.md`**: Context files for AI assistants (contains strict file organization rules).

## Development Conventions

### File Organization
- **Do not save working files to the root directory.** Use appropriate subdirectories (e.g., `src/`, `tests/`, `docs/`).
- Follow the existing component structure in `src/components/`.

### Styling & Animation
- Use **Tailwind CSS 4** for styling.
- Use **GSAP** for complex animations and scroll interactions.
- Use **Lenis** for smooth scrolling behavior.
- Ensure animations are performance-optimized (aim for 60fps).

### Fonts
- **Syne**: Primary display font.
- **Inter**: Secondary body font.
- Fonts are loaded via `next/font/google` in `src/app/layout.jsx`.

## Deployment
The project is configured for deployment on **Vercel** with automatic deployments from GitHub.
- Configuration: `vercel.json`, `next.config.js`.
- Image Optimization: Configured for `ktg.one` and Hostinger domains.
