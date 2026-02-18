# Kipos Plus Site

Static marketing website built with plain HTML/CSS/JS and a Vite production build.

## How It Works

- `index.html` is the main page.
- `styles.css` contains all styling.
- `script.js` handles mobile menu toggle // gallery carousel navigation // image modal open/close // contact form submit behavior.
- Lucide icons are loaded from CDN in `index.html` and rendered with `lucide.createIcons()`.

## Fonts

Fonts are self-hosted and loaded from local `.woff2` files.

- Display font: `Ysabeau Office` (CSS var `--font-display`)
  - `700`: `fonts/web/ysabeau-office/ysabeau-office-700.woff2`
- Body font: `Lato` (CSS var `--font-body`)
  - `400`: `fonts/web/lato/lato-400.woff2`

`@font-face` is defined in `styles.css` with `font-display: swap`.
Only the critical display font is preloaded in `index.html`, and Google Fonts links are removed.

## Images

Original source images are in `assets/`:

- `hero-garden.jpeg` (1920x1080)
- `logo.png` (1024x1024)
- `kipos-service-1.png` (1536x1024)
- `kipos-service-2.png` (1536x1024)
- `kipos-service-3.jpg` (3072x4080)
- `kipos-service-4.jpeg` (640x640)
- `kipos-service-5.jpg` (3072x4080)
- `kipos-service-6.jpeg` (640x640)

Optimized responsive images are generated into `assets/optimized/` by `scripts/optimize-images.mjs`.

Generated size sets:

- Gallery thumbnails: `360`, `720` px widths (`assets/optimized/gallery/thumb`)
- Gallery modal/full: `1280`, `1920` px widths (`assets/optimized/gallery/full`)
- Hero: `960`, `1440`, `1920` px widths (`assets/optimized/hero`)
- Logo: `44`, `64`, `88`, `128` px widths (`assets/optimized/logo`)

Formats generated:

- Gallery/Hero: `avif`, `webp`, `jpg`
- Logo: `avif`, `webp`, `png`

## Scripts

From `package.json`:

- `npm run dev`: start Vite dev server
- `npm run optimize:images`: generate optimized images with Sharp
- `npm run build`: production build with Vite
- `npm run build:prod`: optimize images, then build
- `npm run preview`: preview `dist/` locally

## Build Output

- Production files are emitted to `dist/`.
- JS and CSS are minified and filename-hashed by Vite.
