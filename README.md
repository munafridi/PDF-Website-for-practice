# PDF Toolkit

Beginner-friendly PDF tools website — sab kuch browser me chalta hai, koi server nahi.

## Tools

- **Image to PDF** — JPG/PNG images ko ek PDF me convert karo
- **Merge PDF** — multiple PDFs ko ek me combine karo
- **Split PDF** — selected pages ki nayi PDF download karo
- **Compress PDF** — PDF size kam karo

## Tech

React + Vite + JavaScript + plain CSS. Libraries: `jspdf`, `pdf-lib`, `pdfjs-dist`.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

```bash
npm run deploy
```

Ye `dist/` build ko `gh-pages` branch pe push karta hai. Phir repo
Settings → Pages → source `gh-pages` branch select karo.
