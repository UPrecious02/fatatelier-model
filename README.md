# Fatalier – Haastrup

Clickable prototype of the Fatatelier 3D design and project platform. Plain HTML, CSS and JavaScript with Three.js from a CDN. No build step, no backend.

## Project structure

```
fatalier-haastrup/
├── index.html      Page markup: header, views, modals
├── css/styles.css  Design tokens (colours, fonts) at the top, then all styles
├── js/app.js       Everything else, in sections:
│                     catalog & materials · seed data · textures · furniture builders
│                     3D stage · Explore tour · Design studio · notifications
│                     account view · admin view · routing · boot
├── netlify.toml    Tells Netlify there's no build; publish the root folder
└── .gitignore
```

## Run it locally

Open the folder in VS Code and use the **Live Server** extension (right-click `index.html` → Open with Live Server). Opening `index.html` directly in a browser also works.

## Where to change things

- **Prices, pieces, sizes:** `CATALOG` near the top of `js/app.js`
- **Finishes, hardware, stone, fabric:** `FINISHES`, `HARDWARE`, `TOPS`, `FABRICS` right below it
- **Sample customers, designs, projects:** the `seed()` function
- **Livingston tour layout and hotspots:** `Explore.init()` and `HOTSPOTS`
- **Colours and fonts:** the `:root` block at the top of `css/styles.css`

After changing seed data, click **Reset demo data** in the site footer. Demo data is cached in the browser.

## Deploy

Push to GitHub. Netlify picks up every push to `main` and redeploys automatically.

## What's real vs. simulated

Real: the 3D engine, walkthrough, live configurator, pricing logic, the full submit → review → quote → project → updates flow, and the admin catalog controls.

Simulated: accounts and passwords (stored in the browser), email/SMS/WhatsApp sending (shown as in-app notifications), and the furniture models (procedural stand-ins for Fatatelier's CAD files).

## Production path

WordPress stays as the marketing site. The platform runs on its own subdomain (e.g. `design.fatatelier.com`) using Next.js with React Three Fiber and GLB models exported from the shop's CAD files. Customers, designs and projects live in Postgres (Supabase), with file storage for progress photos and video. Email goes out through Resend or Postmark, with Twilio for SMS and WhatsApp as add-ons.
