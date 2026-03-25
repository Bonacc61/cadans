# Cadans – AI Assistant Consultancy

**cadans.**
*AI agents that keep your business in rhythm.*
*Jouw agent houdt de cadans.*

---

## Executive Summary

Cadans deploys personal AI assistants to Dutch MKB (SME) owners via WhatsApp. This is a **consulting-grade service**, not SaaS. We sell done-for-you deployments at €2,500-6,000 setup + €250-500/month recurring.

**Business Model**:
- Y1 Target: 40 clients → €120K ARR + €100K setup fees
- Y2 Target: 120 clients → €360K ARR + €300K setup fees
- Gross Margin: 73-91% (COGS: €28-52/client/mo)
- Net Margin: 50-60% after founder + deployment specialist

**Tech Stack**: NanoClaw framework (500 lines), Claude Agent SDK, WhatsApp Business API, Hetzner VPS (EU-hosted, GDPR-compliant)

---

## Table of Contents

1. [Design Excellence](#1-design-excellence-mandatory)
2. [Business Strategy](#2-business-strategy)
3. [Product Development](#3-product-development)
4. [Deployment System](#4-deployment-system)
5. [Operations & Scaling](#5-operations--scaling)
6. [Legal & Compliance](#6-legal--compliance)
7. [Brand Identity](#7-brand-identity)
8. [Development Standards](#8-development-standards)
9. [Quick Reference](#9-quick-reference)

---

## Key Principles

### 1. Design Excellence (MANDATORY)

**ALL frontend/UI work MUST use the UI/UX Pro Max skill.**

#### When to Use UI/UX Pro Max

Use for ANY task involving:
- Landing pages, marketing sites, web apps
- Component design (cards, forms, modals, buttons)
- Color schemes, typography, spacing systems
- Layout structure, responsive design
- Navigation patterns, animations, interactions
- UI code review, accessibility improvements

#### How to Use UI/UX Pro Max

**Location**: `/root/cadans/ui-ux-pro-max/`

**Step 1: Generate Design System (REQUIRED for new pages/projects)**
```bash
cd /root/cadans/ui-ux-pro-max
python3 scripts/search.py "business productivity saas professional trustworthy" --design-system --persist -p "Cadans" -f markdown
```

**Step 2: Domain-Specific Searches (as needed)**
```bash
# Typography options
python3 scripts/search.py "professional elegant premium" --domain typography

# Color palettes
python3 scripts/search.py "business saas trustworthy" --domain color

# UX best practices
python3 scripts/search.py "animation accessibility forms" --domain ux

# Landing page structure
python3 scripts/search.py "hero social-proof pricing" --domain landing
```

**Step 3: Review Against Standards**
- Check Quick Reference in `/root/cadans/ui-ux-pro-max/SKILL.md`
- Verify Accessibility (contrast 4.5:1, focus states, aria-labels)
- Confirm touch targets ≥44px, spacing ≥8px
- Test responsive behavior (mobile-first)

#### Design System Persistence

Design decisions are saved to:
- `ui-ux-pro-max/design-system/MASTER.md` – Global design rules
- `ui-ux-pro-max/design-system/pages/[page-name].md` – Page-specific overrides

Always check these files before starting new UI work.

#### Pre-Delivery Checklist

Before delivering UI code:
- [ ] UI/UX Pro Max design system generated and consulted
- [ ] Typography is **not** basic Inter (use sophisticated pairing from design system)
- [ ] Color palette is premium and trustworthy (not generic)
- [ ] Micro-interactions use proper timing (150-300ms, cubic-bezier easing)
- [ ] Mobile-first responsive design
- [ ] Accessibility: contrast ≥4.5:1, keyboard nav, aria-labels
- [ ] Touch targets ≥44px with ≥8px spacing
- [ ] No emoji icons (use SVG: Heroicons, Lucide)
- [ ] Loading states, error states, empty states
- [ ] Dark mode support (if applicable)

---

### 2. Brand Identity

**Target Audience**: Dutch MKB owners (40-60 years old, overwhelmed by email/admin)

**Brand Attributes**:
- Professional, trustworthy, premium
- Dutch-first (language, cultural references)
- Human-centric (not tech-forward)
- Calm, organized, efficient

**Visual Language** (from UI/UX Pro Max):
- Sophisticated typography (e.g., Space Grotesk + Instrument Sans, not Inter)
- Professional color palette (deep blues, slate grays, accent purples)
- Subtle micro-interactions (gentle animations, smooth transitions)
- Clean, spacious layouts (not cramped)
- Real product demos (WhatsApp mockups showing actual use cases)

---

### 3. Development Standards

**Frontend**:
- HTML/CSS/JS for landing pages (no framework bloat)
- Deploy via Cloudflare Pages
- Semantic HTML, accessible markup
- WebP/AVIF images, lazy loading
- Mobile-first, responsive

**Backend/Service**:
- NanoClaw framework (Node.js)
- Model routing: Haiku 4.5 (simple) + Sonnet 4.6 (complex)
- WhatsApp Business API integration
- EU-hosted (Hetzner), GDPR-compliant

**Documentation**:
- Keep `docs/` updated with technical decisions
- Maintain `brand/` for visual identity assets
- Update `templates/` with deployment patterns

---

### 4. Communication Style

**Dutch (primary language)**:
- Direct, clear, practical
- "Je" (informal) for landing page, "U" (formal) for contracts
- Avoid jargon, explain technical concepts simply
- Use real examples (email triage, calendar management)

**Tone**:
- Confident but not arrogant
- Helpful, empathetic
- Results-focused ("2.2 uur per dag terug")

---

## File Structure

```
cadans/
├── CLAUDE.md                    # This file (project instructions)
├── README.md                    # Project overview
├── ui-ux-pro-max/              # UI/UX design system (MANDATORY for frontend)
│   ├── SKILL.md                # Complete usage guide
│   ├── design-system/          # Persisted design decisions
│   │   ├── MASTER.md          # Global design system
│   │   └── pages/             # Page-specific overrides
│   ├── data/                   # Design databases (symlink)
│   └── scripts/                # Search tools (symlink)
├── brand/                      # Brand assets
│   ├── colors.css
│   ├── logo.svg
│   └── voice-guidelines.md
├── docs/                       # Technical documentation
│   ├── README.md
│   └── technical/
├── templates/                  # Client deployment templates
├── clients/                    # Per-client deployments
└── scripts/                    # Business operations
```

---

## Workflow: Creating a New Landing Page

1. **Design System Generation** (REQUIRED)
   ```bash
   cd /root/cadans/ui-ux-pro-max
   python3 scripts/search.py "saas business professional premium trustworthy" --design-system --persist -p "Cadans" --page "landing" -f markdown
   ```

2. **Read Design System**
   - Check `design-system/MASTER.md`
   - Check `design-system/pages/landing.md` (if exists)

3. **Implement UI**
   - Use recommended typography (NOT Inter)
   - Apply color palette from design system
   - Follow spacing scale (4px/8px increments)
   - Add micro-interactions (150-300ms timing)
   - Ensure accessibility (contrast, focus states, aria-labels)

4. **Review Against Checklist**
   - Run through Pre-Delivery Checklist (§1 above)
   - Verify mobile responsiveness
   - Test keyboard navigation
   - Check dark mode (if applicable)

5. **Deploy**
   - Save to appropriate directory
   - Deploy via Cloudflare Pages
   - Share URL for feedback

---

## Anti-Patterns (AVOID)

**Design**:
- ❌ Using basic Inter font without thoughtful pairing
- ❌ Generic blue gradients, template-like designs
- ❌ Emoji icons (🚀 ⚙️ 📧) instead of SVG
- ❌ Skipping UI/UX Pro Max design system generation
- ❌ Random spacing (must use 4px/8px scale)
- ❌ Poor contrast (<4.5:1 for text)
- ❌ Missing loading/error/empty states

**Development**:
- ❌ Framework overkill for simple landing pages
- ❌ Unoptimized images (use WebP/AVIF + lazy loading)
- ❌ Missing viewport meta, broken mobile experience
- ❌ Inaccessible forms (no labels, poor error messages)

**Content**:
- ❌ Tech jargon without explanation
- ❌ Generic marketing speak ("revolutionize", "cutting-edge")
- ❌ Ignoring Dutch cultural context
- ❌ Vague promises without concrete examples

---

## Quick Commands

```bash
# Generate design system for new page
cd /root/cadans/ui-ux-pro-max && python3 scripts/search.py "<keywords>" --design-system --persist -p "Cadans" --page "<page-name>"

# Search typography options
python3 scripts/search.py "professional elegant" --domain typography

# Search color palettes
python3 scripts/search.py "business trustworthy" --domain color

# UX best practices
python3 scripts/search.py "animation accessibility" --domain ux

# View design system
cat ui-ux-pro-max/design-system/MASTER.md
```

---

## Documentation

- [Documentation Index](docs/README.md)
- [Model Routing](docs/technical/MODEL-ROUTING.md)
- [UI/UX Pro Max Skill](ui-ux-pro-max/SKILL.md)
- Sprint Document: `/root/NanoClaw/Documents/cadans-sprint-v5 (1).pdf`

---

**Built with**: [NanoClaw](https://github.com/your-repo/nanoclaw) | **Target Market**: Netherlands → EU
