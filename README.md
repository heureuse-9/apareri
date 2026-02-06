# APARERI Website (Static + Netlify Forms)

This project is a static HTML/CSS/JS site designed for:
- luxury sustainable fashion positioning
- multimodal product storytelling
- interactive calculators (capsule + multimodal)
- traceability ledger + passport modal
- waitlist via Netlify Forms

## Local preview
Open `index.html` in a browser, or use Live Server in VSCodium.

## Deploy (Netlify) — simplest
1) Create a Netlify account
2) Add new site → **Deploy manually**
3) Drag-and-drop the folder (or ZIP)
4) Open the live URL

### Waitlist submissions
On Netlify: Site → Forms → you should see `waitlist` after the first submission.

## Custom domain
Netlify dashboard → Site → Domain management → Add domain → follow DNS instructions.

## Security
This repo includes a Netlify `_headers` file that sets:
- CSP
- HSTS
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

If you add third-party scripts (analytics, captchas), update the CSP accordingly.

## Where to change content
- Homepage: `index.html`
- Styling: `assets/styles.css`
- Interactivity: `assets/main.js`
- Blog: `/blog/*.html`
