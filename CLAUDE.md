# Design System

This workspace contains print-ready design projects (flyers, posters, banners). Each project lives in its own directory.

## Project Structure

```
Design/
├── render.mjs              # Shared HTML → PNG/PDF render tool
├── package.json            # Node dependencies (playwright)
├── CLAUDE.md               # This file
└── <project-dir>/          # One directory per design project
    ├── assets/             # Images, logos, QR codes, etc.
    ├── content.md          # Source content / copy (plain markdown)
    ├── luma-description.md # Event platform description (if applicable)
    ├── flyer-tailwind.html # The design file (Tailwind CSS via Play CDN)
    ├── flyer-tailwind.png  # Rendered output
    └── flyer-tailwind.pdf  # Rendered output
```

## Tech Stack

- **Styling**: Tailwind CSS via Play CDN (`<script src="https://cdn.tailwindcss.com"></script>`) — no build step
- **Rendering**: Playwright via `render.mjs`
- **Typography**: Noto Sans/Serif CJK SC for Chinese text
- **Language**: Primarily Traditional/Simplified Chinese

## Rendering

Generate PNG + PDF from any project's HTML:

```bash
# From the Design/ root:
node render.mjs <project-dir>/flyer-tailwind.html

# Options:
#   --no-pdf / --no-png    Skip an output format
#   -o <name>              Custom output base name
#   -w <px> -h <px>        Viewport dimensions (default: 2550x3300 = US Letter @ 300dpi)
#   --scale <n>            Device scale factor (default: 1)
#   --wait <ms>            Extra wait after load (default: 1000, for Tailwind CDN)
```

Output files are written next to the input HTML.

## Design Conventions

### Print Dimensions
- Default canvas: **2550 x 3300 px** (US Letter at 300 DPI)
- Content is authored at 1080px width and scaled up via `transform: scale(2.3611)` with `transform-origin: top left`

### Tailwind Usage
- Use Tailwind Play CDN — no npm build, no PostCSS config
- Custom theme colors go in the inline `tailwind.config` script block
- Only use `<style type="text/tailwindcss">` for effects that can't be expressed as utilities (gradient text, radial gradients, complex patterns)
- Prefer arbitrary values (`text-[48px]`, `w-[2550px]`) over custom theme extensions for one-off sizes

### Image Assets
- Store all images in `assets/` subdirectory
- Reference them with relative paths: `src="assets/logo.png"`
- QR codes, logos, photos all go in `assets/`

### Content Workflow
1. Draft copy in `content.md` (plain markdown, easy to edit)
2. Build the visual layout in `flyer-tailwind.html` using Tailwind
3. Run `node render.mjs <dir>/flyer-tailwind.html` to generate PNG + PDF
4. If needed, write a `luma-description.md` for event platform listing

## Creating a New Project

```bash
mkdir <project-name>
mkdir <project-name>/assets
# Place image assets in assets/
# Create content.md with the copy
# Create flyer-tailwind.html with the layout
# Render: node render.mjs <project-name>/flyer-tailwind.html
```
