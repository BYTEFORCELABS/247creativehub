# 247CREATIVEHUB website

Marketing site for 247CREATIVEHUB, a Glasgow-based procurement and supply chain consultancy supporting UK SMEs. It also includes the **Photography & Video** page for the 247 CreativeHub Ltd UK sub-brand.

Built with [Astro](https://astro.build). The output is a fully static site, and the only JavaScript is one small script (about 5 KB) for the interactive parts. Every section still renders without JavaScript.

## Quick start

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview   # serve the production build
npm run check     # type and template checks
```

## Configuration

Copy `.env.example` to `.env` (or set these in your hosting dashboard):

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | The production domain. Used for canonical URLs, Open Graph tags, `robots.txt` and `sitemap-index.xml`. |
| `PUBLIC_FORM_ENDPOINT` | Where the enquiry form sends submissions. Any endpoint that accepts a JSON `POST` and returns 2xx works. |

### Enquiry form: how submission works

The form never pretends to send something it hasn't sent.

- **With `PUBLIC_FORM_ENDPOINT` set:** the form POSTs `name`, `email`, `company`, `service`, `message` and `_subject` as JSON. A success message appears only after a 2xx response. On failure, the visitor's text is kept and they get pre-filled email and WhatsApp links instead.
- **Without it:** the button reads **"Prepare email"**. It opens the visitor's email app with the enquiry pre-filled, and the confirmation says plainly that nothing has been sent until they press Send. WhatsApp and "copy text" options are offered too.

**Recommended setup (Formspree, free tier):** create a form at formspree.io with `agu.desmond@gmail.com` as the recipient. Then set `PUBLIC_FORM_ENDPOINT=https://formspree.io/f/<your-id>` and rebuild. A hidden `_gotcha` honeypot field filters basic spam bots.

## Deploying

Any static host works. On Netlify, Vercel or Cloudflare Pages:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `SITE_URL`, `PUBLIC_FORM_ENDPOINT`

## Project structure

```
src/
  data/site.ts            ← business details, services, process copy (edit content here)
  layouts/Base.astro      ← <head>, SEO/Open Graph, header, footer
  components/             ← one component per homepage section
  scripts/site.ts         ← header, menus, reveals, hero lenses, outcome toggle, form
  styles/global.css       ← design tokens and shared primitives
  pages/                  ← index, photography, privacy, 404, robots.txt
public/                   ← favicon, app icons, og-image.png, manifest
```

## Motion

All motion lives in `src/scripts/motion.ts`, plus a few CSS animations. Every effect switches off for visitors who have "reduce motion" turned on.

| Effect | How it's built |
| --- | --- |
| Smooth scrolling and anchor glides | [Lenis](https://github.com/darkroomengineering/lenis) |
| Hero headline rising word by word | Split at build time, pure CSS (no wait for JavaScript) |
| Section headings rising word by word | Split in the browser, Web Animations API |
| Hero parallax as you scroll away | CSS scroll-driven animation (`animation-timeline`) |
| Ring tilting toward the cursor, magnetic buttons | Pointer tracking with CSS spring-style transitions |
| Green spotlight following the cursor on cards | CSS radial gradient driven by pointer position |
| Service-name marquee that speeds up as you scroll | CSS animation, playback rate tied to Lenis scroll velocity |
| Blur-in reveals, page-to-page fades | CSS transitions and native View Transitions |
| Footer wordmark that rises in, with letters lifting on hover | CSS transitions, triggered when the footer scrolls into view |

## Photos

Photos live in `src/assets/photos/`, not `public/`, so Astro can turn each one into AVIF and WebP files in several sizes. Visitors download only the size that fits their screen, and photos below the fold load as you scroll.

| Where | File |
| --- | --- |
| Hero background (navy duotone, behind the data visual) | `warehouse-lead` |
| Industries cards | `workshop-review`, `retail-stockroom`, `logistics-dispatch`, `wholesale-warehouse`, `care-supplies`, `bid-review` |
| How a project runs (scroll-revealed) | `working-session` |
| Full-width parallax band | `factory-floor` |
| About panel background | `onsite-review` |
| Not used yet | `inventory-scan`, `planning-meeting`, `small-meeting` (too small at 275×183) |

To swap a photo, replace the file and keep the name, or change the `import` at the top of the component. Group photos are only used where they can read as a working session with a client's team. None of them suggest the people shown are 247CREATIVEHUB staff.

## Content rules

- **No invented facts.** There are no client logos, testimonials, certifications, statistics, history or biographies. All copy comes from the original site or plainly describes the service.
- **Every chart is labelled as illustrative.** The hero lenses and the before/after outcomes show the *kind* of change the work aims for, and the UI says they are not client results. Replace them with real figures only when you have verified, shareable results.

---

## Audit of the previous site (November 2026)

The previous site was generated with ChatGPT's site builder (Vinext: Vite + React Server Components). Its source wasn't available, so this is a rebuild.

**Brand.** The logo already sets a clear identity: navy `#06235f`, green `#279b48`, yellow `#f8c900` and warm cream. The logo also places four icons on a ring. The redesign keeps this palette and builds the "Spend / Supply / Stock / Risk" hero visual around the ring idea rather than introducing new colours.

**Issues found:**

| Area | Before | Now |
| --- | --- | --- |
| Mobile navigation | Desktop nav only, with no menu on small screens | Accessible full-screen menu with focus trap and Escape to close |
| Contact | Only mailto and WhatsApp links | Validated enquiry form with a real submission path (see above) |
| Typography | Arial / system fonts | Self-hosted Urbanist (headings), Figtree (body), Instrument Serif (accent) and Geist Mono (chart labels) |
| Services | Numbered text cards | Individual illustrations, expandable "What's included", and CTAs that pre-select the service in the form |
| Outcomes | Four short text items | Illustrative before/after visuals, clearly labelled as not client data |
| Process | Static list | Timeline that fills as you scroll (horizontal on desktop, vertical on mobile) |
| About | Logo variations image | Glasgow / UK-wide panel, areas of expertise, value points |
| SEO | Title and description only | Canonical URL, Open Graph and Twitter tags, share image, `ProfessionalService` JSON-LD, sitemap, robots.txt |
| Accessibility | No skip link or reduced-motion handling; yellow-on-cream contrast failure | Skip link, landmarks, focus styles, keyboard-operable tabs, `prefers-reduced-motion` support, AA contrast |
| Weight | ~131 KB of mostly unused CSS, plus a React runtime | ~112 KB for the whole page, including fonts |

**Verification (production build):**

- Lighthouse, mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100. LCP 1.7 s, CLS 0.
- axe-core: no violations on any page.
- Automated interaction tests: navigation, dropdown, mobile menu, hero lenses (mouse and keyboard), outcome toggle, service pre-select, form validation, both submission modes (including endpoint failure), and the email and WhatsApp links.

## Before going live

1. Set `PUBLIC_FORM_ENDPOINT` (see above) and `SITE_URL`.
2. Read through the **privacy notice** (`src/pages/privacy.astro`) and confirm it matches how enquiries are actually handled. It is a plain-English starting point, not legal advice.
3. Consider a domain email address (for example `hello@yourdomain.co.uk`) instead of Gmail. It noticeably increases trust for a B2B consultancy. Update `src/data/site.ts` when ready.
4. Submit `sitemap-index.xml` to Google Search Console after launch.
