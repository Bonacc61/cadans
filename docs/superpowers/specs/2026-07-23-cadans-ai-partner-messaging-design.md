# Design: "AI Partner" messaging rework — cadans.ai

**Date:** 2026-07-23
**Scope:** `landing/index.html` (main) + `landing/geo/index.html` (GEO subpage)
**Fallback:** `landing-versions/v1-2026-07-23/` (committed `2faf6fb`)

---

## 1. Positioning & through-line

Reposition Cadans from a **5-product menu** to **one AI partner that keeps your whole
business in rhythm**. A partner looks at your business, builds what fits, and stays
involved — it does not hand you a catalog of unfamiliar nouns.

**Through-line rule:** every section is written from the owner's side of the table
("je inbox", "je telefoon", "je terugkerende taken"). Breadth then reads as *coverage
of your world*, not a *product line*. This is what earns the word "partner."

**Constraint — SEO is the primary discovery channel** (minimal paid marketing). Copy
must carry searchable keywords in *visible, rendered* text (H1/H2/H3, subtitles, card
bodies, `<title>`/meta). Technique: pair an emotional owner-side label (the hook) with
a keyword-rich service subtitle (the index target). Both audiences served.

**Priority keyword clusters** (chosen by user): 1) AI-assistent / MKB,
3) Workflow / automatisering, 4) GEO / website. Voice + Webdev stay as full services
but are not keyword-optimized as hard.

**Language:** NL is the SEO + default language. EN toggle stays for clarity. Main page
uses informal **je**; GEO subpage keeps formal **u** (B2B/bureau audience).

---

## 2. Main page — section-by-section

### Hero
- **H1 (NL):** `Jouw AI-partner die de cadans houdt.`
  (keeps brand metaphor; "AI-partner" is itself a keyword)
- **H1 (EN):** `Your AI partner that keeps the rhythm.`
- **Subhead (NL):** *"We kijken naar je bedrijf, bouwen wat past en blijven betrokken —
  van AI-assistent en workflow-automatisering tot maatwerk-software en vindbaarheid in
  AI. Eén partner voor het Nederlandse MKB."*
- **Subhead (EN):** parallel translation.
- Rotating task chips: **unchanged** (already reinforce coverage).
- CTAs unchanged.

### Products → "What we take off your plate"
- **Section title (NL):** `Eén partner. Alles wat AI voor je bedrijf kan doen.`
- **Section intro (NL):** *"We beginnen waar het het meest knelt en groeien mee — van je
  inbox tot je vindbaarheid in AI."*
- **Tab labels + card headers** (5 tabs; card H3 carries the keyword). **Bold = priority
  SEO cluster.** Tab `data-tab` ids, panels, pricing, and card body bullets stay as-is;
  only the tab label text, card H3, and keyword subtitle change:

  | tab id | Tab label (NL) | Card H3 (emotional) | Keyword subtitle (indexed, visible) |
  |---|---|---|---|
  | `pa` | Je inbox & WhatsApp | Je inbox en WhatsApp, afgehandeld | **AI-assistent voor het MKB** |
  | `webdev` | Je website & software | Je website en software, gebouwd | Websites & webapplicaties op maat |
  | `geo` | Gevonden in AI | Gevonden worden in ChatGPT & AI | **GEO — vindbaarheid in AI** |
  | `voice` | Je telefoon | Je telefoon neemt altijd op | AI-voicebot voor reserveringen |
  | `automation` | Je processen | Je terugkerende taken, geautomatiseerd | **Workflow-automatisering voor het MKB** |

  EN equivalents provided for every string (page is bilingual via `nl-only`/`en-only`
  spans + `data-lang` toggle).

### Werkwijze (5 days / 3 steps)
- **Unchanged** structure. Optional one-line nudge so step 1 ("Intake gesprek") frames
  Cadans as a partner assessing the business, not a vendor taking an order. Low priority.

### Waarom cadans (6 cards)
- Keep all 6. Reframe two to lean into "partner" explicitly:
  - **Consulting-kwaliteit** card → emphasize "je vaste AI-partner, niet los gereedschap".
  - **Voor elk MKB** card → emphasize the partner adapts to the sector.
- Other 4 cards (GDPR/EU, Nederlands, Altijd beschikbaar, Meetbaar resultaat) unchanged.

### Contact
- **Unchanged** copy. The `<select>` options already list the 5 services — update those
  option labels to match new tab labels for consistency (keep them recognizable).

### SEO / meta (main page)
- `<title>` → `Cadans — AI-partner voor het MKB | AI-assistent, automatisering & GEO`
- `<meta name="description">` → rewritten around the 3 clusters + partner framing,
  ≤ 155 chars.
- `og:` / `twitter:` tags kept in sync if present.
- **JSON-LD** (new `<script type="application/ld+json">` in `<head>`):
  - `Organization` (name, url, logo, areaServed NL, contactPoint email hallo@cadans.ai)
  - `Service` entries for the priority clusters (AI-assistent, workflow-automatisering,
    GEO) with Dutch names/descriptions.
  - Single H1 preserved; H2/H3 hierarchy stays clean.

---

## 3. GEO subpage (`landing/geo/index.html`)

Already strong and keyword-dense; formal **u** voice stays. Changes are additive:
- Tie into the partner narrative: one line positioning GEO as *part of what your AI
  partner handles*, with a link back to the main page's product section.
- Reinforce priority keywords already present ("vindbaarheid in AI", "GEO",
  "Generative Engine Optimization", "gevonden worden in ChatGPT") in H2s/subtitles where
  natural — no keyword stuffing.
- `<title>` / `<meta description>`: verify they carry "GEO" + "vindbaarheid in AI" +
  "Nederland/MKB"; tighten if weak.
- **JSON-LD** `Service` block for GEO specifically (helps LLM citation — the service
  Cadans literally sells).
- Structure, layout, CSS, JS: **unchanged**.

---

## 4. Out of scope (this pass)
- `landing/bureaus/index.html`, `landing/assistent/index.html` — separate later pass.
- Layout, CSS, JS behavior, animations, pricing numbers.
- New sections or imagery.

## 5. Success criteria
- [ ] Reading the page top-to-bottom, "one partner" is the dominant impression (no
      "menu of 5 tools" feel).
- [ ] Each of the 3 priority keyword clusters appears in ≥1 visible heading/subtitle
      and in `<title>` or meta.
- [ ] Exactly one H1; clean H2/H3 hierarchy; valid JSON-LD (passes a schema validator).
- [ ] NL + EN strings both present for every changed element; toggle still works.
- [ ] No layout/CSS/JS regressions; page renders identically in structure.
- [ ] `landing-versions/v1-2026-07-23/` remains an intact fallback.
