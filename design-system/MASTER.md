# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Cadans
**Generated:** 2026-03-22
**Category:** AI Agent Services for Dutch SMB (GDPR-Compliant SaaS)
**Design Inspiration:** Professional, trustworthy, Dutch-market focused

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable | Name |
|------|-----|--------------|------|
| Primary | `#4F46E5` | `--color-primary` | Cadans Indigo |
| Secondary | `#0D9488` | `--color-secondary` | Signal Teal |
| CTA/Accent | `#F59E0B` | `--color-cta` | Action Amber |
| Background | `#FAFAFA` | `--color-background` | Warm White |
| Surface | `#FFFFFF` | `--color-surface` | Pure White |
| Text Primary | `#0F172A` | `--color-text-primary` | Slate 900 |
| Text Secondary | `#475569` | `--color-text-secondary` | Slate 600 |
| Border | `#E2E8F0` | `--color-border` | Slate 200 |

**Color Notes:**
- Cadans Indigo (#4F46E5) for trust and professionalism
- Signal Teal (#0D9488) for AI/automation cues
- Amber for CTAs (warm, inviting, Dutch-friendly)

### Typography

- **Display Font:** Space Grotesk (headings, hero text, brand moments)
- **Body Font:** Instrument Sans (UI, body text, forms)
- **Accent Font:** Instrument Serif (quotes, testimonials, highlights)
- **Mood:** modern, professional, approachable, Dutch-friendly, trustworthy, human

**Google Fonts Link:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
```

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
```

**Typography Scale:**
```css
:root {
  --font-display: 'Space Grotesk', system-ui, -apple-system, sans-serif;
  --font-body: 'Instrument Sans', system-ui, -apple-system, sans-serif;
  --font-accent: 'Instrument Serif', Georgia, serif;

  /* Type Scale */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  --text-6xl: 3.75rem;    /* 60px */
}
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps, icon spacing |
| `--space-sm` | `8px` / `0.5rem` | Inline spacing, badges |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Card padding, large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |
| `--space-4xl` | `96px` / `6rem` | Large section breaks |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle lift, borders |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.06)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.08)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.10)` | Hero sections, featured elements |

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Badges, tags |
| `--radius-md` | `8px` | Buttons, inputs |
| `--radius-lg` | `12px` | Cards, containers |
| `--radius-xl` | `16px` | Modals, large sections |
| `--radius-full` | `9999px` | Pills, avatars |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--color-cta);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-base);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
}

.btn-primary:hover {
  background: #D97706; /* Amber-600 */
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: 10px 22px; /* -2px to account for border */
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-base);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: white;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-weight: 500;
  font-size: var(--text-base);
  transition: all 150ms ease;
  cursor: pointer;
  border: none;
}

.btn-ghost:hover {
  background: rgba(79, 70, 229, 0.05);
  color: var(--color-primary);
}
```

### Cards

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.card-interactive {
  cursor: pointer;
}

/* Pricing Card Variant */
.card-pricing {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  position: relative;
}

.card-pricing.featured {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-xl);
}

.card-pricing.featured::before {
  content: "Populair";
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: white;
  padding: 4px 16px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
}
```

### Inputs & Forms

```css
.input {
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-base);
  transition: border-color 150ms ease, box-shadow 150ms ease;
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

/* Label */
.label {
  display: block;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

/* Helper Text */
.helper-text {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

/* Error State */
.input.error {
  border-color: #DC2626; /* Red-600 */
}

.error-message {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: #DC2626;
  margin-top: var(--space-xs);
}
```

### Badges & Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
}

.badge-primary {
  background: rgba(79, 70, 229, 0.1);
  color: var(--color-primary);
}

.badge-success {
  background: rgba(13, 148, 136, 0.1);
  color: var(--color-secondary);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-cta);
}

.badge-neutral {
  background: rgba(15, 23, 42, 0.05);
  color: var(--color-text-secondary);
}
```

### Modals

```css
.modal-overlay {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 100%;
  position: relative;
}

.modal-header {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}

.modal-close {
  position: absolute;
  top: var(--space-lg);
  right: var(--space-lg);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color 150ms ease;
}

.modal-close:hover {
  color: var(--color-text-primary);
}
```

---

## Cadans-Specific Patterns

### Hero Section (Landing Page)

```html
<section class="hero">
  <div class="container">
    <h1 class="hero-title">
      Jouw AI-assistent voor
      <span class="gradient-text">e-mail en agenda</span>
    </h1>
    <p class="hero-description">
      Cadans helpt Nederlandse ondernemers met AI-gedreven automatisering.
      Krijg 10-15 uur per week terug.
    </p>
    <div class="hero-cta">
      <button class="btn-primary">Start gratis proef</button>
      <button class="btn-ghost">Bekijk demo</button>
    </div>
  </div>
</section>
```

```css
.hero {
  padding: var(--space-4xl) var(--space-md);
  background: linear-gradient(135deg, #FAFAFA 0%, #F3F4F6 100%);
  text-align: center;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 3.75rem);
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.1;
  margin-bottom: var(--space-lg);
}

.gradient-text {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-family: var(--font-body);
  font-size: var(--text-xl);
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto var(--space-2xl);
  line-height: 1.6;
}

.hero-cta {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}
```

### Agent Feature Card

```html
<div class="agent-card">
  <div class="agent-icon">
    <svg><!-- Icon --></svg>
  </div>
  <h3 class="agent-title">Personal Assistant</h3>
  <p class="agent-price">Vanaf €250/maand</p>
  <p class="agent-description">
    E-mail, agenda, en WhatsApp — geautomatiseerd.
  </p>
  <ul class="agent-features">
    <li>Inbox zero automatisering</li>
    <li>Agenda-coördinatie</li>
    <li>WhatsApp integratie</li>
  </ul>
  <button class="btn-secondary">Meer info</button>
</div>
```

```css
.agent-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  text-align: center;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.agent-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.agent-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-lg);
  background: rgba(79, 70, 229, 0.1);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.agent-icon svg {
  width: 32px;
  height: 32px;
  color: var(--color-primary);
}

.agent-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.agent-price {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-secondary);
  font-weight: 600;
  margin-bottom: var(--space-md);
}

.agent-description {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
  line-height: 1.6;
}

.agent-features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-xl);
  text-align: left;
}

.agent-features li {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  padding-left: var(--space-lg);
  margin-bottom: var(--space-sm);
  position: relative;
}

.agent-features li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--color-secondary);
  font-weight: bold;
}
```

### Trust Signal Section

```html
<section class="trust-signals">
  <div class="container">
    <div class="trust-grid">
      <div class="trust-item">
        <div class="trust-icon">🔒</div>
        <h4>GDPR-compliant</h4>
        <p>4-laagse encryptie</p>
      </div>
      <div class="trust-item">
        <div class="trust-icon">🇳🇱</div>
        <h4>Nederlands</h4>
        <p>Lokale hosting</p>
      </div>
      <div class="trust-item">
        <div class="trust-icon">⚡</div>
        <h4>10-15 uur/week</h4>
        <p>Tijdsbesparing</p>
      </div>
      <div class="trust-item">
        <div class="trust-icon">💬</div>
        <h4>WhatsApp</h4>
        <p>Direct bereikbaar</p>
      </div>
    </div>
  </div>
</section>
```

**Note:** Replace emoji icons with SVG from Heroicons/Lucide in production.

```css
.trust-signals {
  padding: var(--space-3xl) var(--space-md);
  background: var(--color-surface);
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.trust-item {
  text-align: center;
}

.trust-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.trust-item h4 {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.trust-item p {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
```

### Dutch Language Toggles

For bilingual content (Dutch/English):

```html
<div class="lang-toggle">
  <button class="lang-btn active">NL</button>
  <button class="lang-btn">EN</button>
</div>
```

```css
.lang-toggle {
  display: inline-flex;
  gap: 4px;
  background: var(--color-background);
  border-radius: var(--radius-full);
  padding: 4px;
}

.lang-btn {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
  cursor: pointer;
  transition: all 150ms ease;
}

.lang-btn.active {
  background: var(--color-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.lang-btn:hover:not(.active) {
  color: var(--color-text-primary);
}
```

---

## Style Guidelines

**Style:** Professional Minimalism (Dutch Market)

**Keywords:** clean, trustworthy, approachable, modern, Dutch-friendly, professional, human, warm

**Best For:** B2B SaaS, SMB tools, professional services, Dutch market, trust-critical products

**Key Effects:**
- Subtle shadows (never heavy)
- Smooth transitions (150-300ms cubic-bezier)
- Gradient text for brand moments only
- Ample whitespace
- Clear hierarchy via typography scale

### Page Pattern

**Pattern Name:** Trust-First Landing

- **Conversion Strategy:** Lead with time savings, build trust with GDPR/Dutch hosting, show pricing transparency
- **CTA Placement:** Hero (primary), pricing section (secondary), footer (tertiary)
- **Section Order:**
  1. Hero (value proposition + social proof)
  2. Agent showcase (3-5 cards)
  3. How it works (3 steps)
  4. Pricing (transparent tiers)
  5. Trust signals (GDPR, Dutch, testimonials)
  6. FAQ
  7. Final CTA
  8. Footer (links, contact, legal)

---

## Micro-interactions

### Button Press Feedback

```css
.btn-primary:active,
.btn-secondary:active {
  transform: scale(0.98);
  transition: transform 80ms ease;
}
```

### Card Hover Scale

```css
.agent-card:hover {
  transform: translateY(-4px) scale(1.01);
}
```

### Input Focus Animation

```css
.input:focus {
  animation: input-focus 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes input-focus {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
}
```

---

## Anti-Patterns (Do NOT Use)

### Forbidden Elements
- ❌ **Inter font** — Use Space Grotesk + Instrument Sans instead
- ❌ **Generic blue gradients** — Use Cadans Indigo + Signal Teal
- ❌ **Emoji icons in production** — Use SVG (Heroicons, Lucide)
- ❌ **English-only content** — Default to Dutch, offer EN toggle
- ❌ **Hidden pricing** — Always show transparent pricing tiers
- ❌ **Automatic sends without HITL** — Default to manual approval for GDPR compliance

### Forbidden Patterns
- ❌ Excessive animation or decoration
- ❌ Low contrast text (<4.5:1)
- ❌ Missing focus states
- ❌ Instant state changes (0ms transitions)
- ❌ Layout-shifting hovers
- ❌ Horizontal scroll on mobile
- ❌ Tiny touch targets (<44px)
- ❌ Removing cursor:pointer from clickable elements
- ❌ Mixing font families randomly
- ❌ Hardcoded colors instead of CSS variables

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

### Visual Quality
- [ ] Typography is **NOT** Inter (use Space Grotesk + Instrument Sans)
- [ ] Color palette from design system (NOT generic blue)
- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent set (Heroicons/Lucide)
- [ ] Gradient text only for brand moments (hero headlines)
- [ ] `cursor-pointer` on all clickable elements

### Interaction
- [ ] Micro-interactions: 150-300ms timing
- [ ] Cubic-bezier easing (NOT linear)
- [ ] Touch targets ≥44px (mobile)
- [ ] Spacing ≥8px between interactive elements
- [ ] Hover states with smooth transitions
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected

### Content
- [ ] Default language: Dutch (offer EN toggle if needed)
- [ ] Pricing transparency (show €/month)
- [ ] GDPR notices where applicable
- [ ] "Populair" badge on featured pricing tier

### Responsive
- [ ] Mobile-first breakpoints: 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] No content hidden behind fixed navbars
- [ ] Text contrast 4.5:1 minimum
- [ ] Readable line length (60-75 chars)

### Performance
- [ ] Font preload for Space Grotesk + Instrument Sans
- [ ] Image optimization (WebP/AVIF)
- [ ] Lazy load below-the-fold content
- [ ] No layout shift (CLS < 0.1)

---

## Quick Reference Commands

### Generate design system for new page
```bash
cd /root/cadans/ui-ux-pro-max
python3 scripts/search.py "dutch smb saas professional trustworthy" --design-system --persist -p "Cadans" --page "agent-name"
```

### Search for specific components
```bash
# Pricing tables
python3 scripts/search.py "pricing saas transparent" --domain landing -n 5

# Trust signals
python3 scripts/search.py "trust badges social proof" --domain ux -n 5

# Dutch market patterns
python3 scripts/search.py "professional approachable trustworthy" --domain style -n 5
```

---

**Last Updated:** 2026-03-22
**Maintained By:** Cadans Design System
**Version:** 1.0.0
