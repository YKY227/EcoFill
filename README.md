# EcoRewards Web (React + Vite + TS)

Install & run:
```bash
npm i
cp .env.example .env   # set VITE_API_BASE_URL
npm run dev
```

Build:
```bash
npm run build && npm run preview
```

## GitHub Hosting & Deploy

Initialize Git and push:
```bash
git init
git add .
git commit -m "init: EcoRewards web scaffold"
git branch -M main
git remote add origin https://github.com/<your-username>/ecorewards-web.git
git push -u origin main
```

### Option A: GitHub Pages (SPA)
Use `gh-pages` quickly:
```bash
npm run build
npm run deploy:gh
```
Then in GitHub repository settings → Pages → select `gh-pages` branch.

> Note: For SPA routing on Pages, prefer Netlify or Vercel for automatic SPA fallback.

### Option B: Vercel/Netlify (Recommended)
- **Vercel**: Import repo → Framework: Vite → Build: `npm run build` → Output: `dist`
- **Netlify**: Build command `npm run build`, Publish directory `dist`, enable SPA fallback.

## Tech
- React + TypeScript + Vite
- TailwindCSS
- React Router
- TanStack Query
- html5-qrcode
- Recharts
- PWA (installable app)
- Nice-to-Haves: badges, toasts, skeletons, dark mode
