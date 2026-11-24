# InkNest Notes

A handwriting-first study notebook for your PC — in the spirit of GoodNotes, built to run fully offline.
Your notebooks live on your computer; nothing is uploaded anywhere.

## Get it running

**Fastest (no install):** double-click **`Start-InkNest.bat`**. InkNest opens in its own window using the
Edge or Chrome already on your PC.

**Real Windows installer (`Setup.exe` with Start-menu + desktop shortcut and the InkNest icon):**

1. Install Node.js LTS from https://nodejs.org (one time).
2. Double-click **`Build-Windows-Installer.bat`** (about 3 minutes, needs internet the first time).
3. Open the new `dist` folder:
   - `InkNest Notes Setup 1.0.0.exe` — installer
   - `InkNest Notes 1.0.0.exe` — portable version, no install

No Node on your PC? Upload this folder to a GitHub repository and run the **Build Windows installer**
workflow (Actions tab) — it produces the same `.exe` files for download.

To try it as a desktop app without building: `npm install` then `npm start`.

## Features

- **Notebook library** with colour covers, search (titles *and* typed text), rename, duplicate, delete
- **Pen** with stylus pressure, **highlighter** (sits under your ink), **eraser** (also the stylus eraser end)
- **Shapes** (line, arrow, rectangle, ellipse — hold Shift to snap), **text boxes**, **images** (insert, drag & drop, paste)
- **Select tool**: move, resize, recolour, copy / paste / duplicate, bring to front / send to back
- **Laser pointer** for presenting, **hand tool / Space-drag** to scroll, **Ctrl+wheel** zoom
- **Pages**: add, duplicate, reorder by dragging, star, delete — with thumbnails
- **Templates**: blank, lined, grid, dots, Cornell — in white, cream, mint, sky or dark paper
- **Stylus-only mode** (palm protection: finger touch scrolls instead of drawing)
- **Study timer** (Pomodoro focus/break sessions, daily focus stats) and **dark mode**
- **Export** a notebook to **PDF**, a page to **PNG**, or a backup file (`.inknest`) you can import again
- **Autosave** after every change

## Shortcuts

| Key | Action | Key | Action |
|---|---|---|---|
| P / H / E | Pen / Highlighter / Eraser | Ctrl+Z / Ctrl+Y | Undo / Redo |
| V / S / T / L | Select / Shapes / Text / Laser | Ctrl+C / V / D | Copy / Paste / Duplicate |
| Space + drag | Scroll | Del | Delete selection |
| Ctrl + wheel | Zoom | Ctrl+0 | Fit page to width |
| PgUp / PgDn | Previous / next page | Ctrl+S | Save now |

## Customising the name, logo and publisher

- Product name & publisher: `package.json` (`productName`, `author`, `build.copyright`)
- Logo shown in the app: `app/logo.svg`
- Installer / taskbar icon: `build/icon.ico` and `build/icon.png`

## Where is my data?

In the app's local storage on your PC. Use **Export → notebook file (.inknest)** for backups,
and **Import** on the library screen to restore.
