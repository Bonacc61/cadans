# Cadans – AI Assistant Consultancy

**cadans.** — *AI agents that keep your business in rhythm.*

---

## Executive Summary

Cadans deploys WhatsApp AI assistants to Dutch MKB owners. **Consulting-grade service**, not SaaS.

- **Business**: €2,500-6,000 setup + €250-500/mo recurring
- **Y1 Target**: 40 clients → €120K ARR
- **Margin**: 73-91% gross, 50-60% net
- **Tech**: NanoClaw (500 lines), Claude Agent SDK, WhatsApp, Hetzner VPS (EU)

**Key Docs**:
- [Business Strategy](BUSINESS-STRATEGY.md) — Market, pricing, personas, product roadmap
- [Deployment & Ops](DEPLOYMENT-OPERATIONS.md) — 5-day workflow, scaling, cost tracking
- [Legal & Compliance](LEGAL-COMPLIANCE.md) — GDPR, EU AI Act, contracts

---

## 0. Task Completion Protocol (MANDATORY)

**After completing ANY non-trivial task, provide a succinct semi-technical explanation.**

### Format

```
## What I Just Did

**Task:** [One-line description]

**Files changed:**
- [file_path:line_range] — [what changed]
- [file_path:line_range] — [what changed]

**Technical approach:**
[2-3 sentences explaining the implementation strategy, key decisions, or architectural choices]

**Why this works:**
[1-2 sentences on the reasoning or benefit]

**Next steps (if applicable):**
- [action item 1]
- [action item 2]
```

### Example

```
## What I Just Did

**Task:** Built Collect agent scaffolding with Dutch payment reminder workflow

**Files changed:**
- agents/collect/config/agent.json:1-50 — Agent metadata, pricing tiers, integrations
- agents/collect/skills/reminder_workflow.md:1-450 — 5-stage escalation process (friendly → legal)
- agents/collect/templates/*.txt:1-20 — Dutch reminder templates with variable substitution

**Technical approach:**
Created a state-machine workflow (Day 15/22/30/36/46) with sentiment detection keywords, GDPR-compliant admin fees (€40 after 2nd reminder), and wettelijke rente calculation. Templates use {variable} syntax for dynamic content injection.

**Why this works:**
Dutch legal requirements mandate specific escalation timing and cost disclosures. The workflow preserves client relationships (friendly first 2 stages) while enforcing payment obligations (legal language stage 3+). Human-in-the-loop at Day 36 prevents automation errors.

**Next steps:**
- Build Support agent (FAQ + ticket triage)
- Integrate with Exact Online/Moneybird APIs
```

### When to Use

- ✅ After completing a coding task (>50 lines)
- ✅ After creating new files/structure
- ✅ After architectural decisions
- ✅ After fixing complex bugs
- ✅ After research/analysis tasks

### When to Skip

- ❌ Trivial edits (<10 lines)
- ❌ Simple file reads/searches
- ❌ User explicitly asks you to skip it

---

## 1. Design Excellence (MANDATORY)

### All frontend work MUST use UI/UX Pro Max

**Location**: `/root/cadans/ui-ux-pro-max/`

**Workflow**:
```bash
# Step 1: Generate design system (REQUIRED for new pages)
cd /root/cadans/ui-ux-pro-max
python3 scripts/search.py "business saas professional premium trustworthy" --design-system --persist -p "Cadans"

# Step 2: Domain searches (as needed)
python3 scripts/search.py "professional elegant" --domain typography
python3 scripts/search.py "business trustworthy" --domain color
python3 scripts/search.py "animation accessibility" --domain ux
```

**Design system is saved to**:
- `ui-ux-pro-max/design-system/MASTER.md` (global rules)
- `ui-ux-pro-max/design-system/pages/[page-name].md` (page overrides)

### Pre-Delivery Checklist

- [ ] UI/UX Pro Max design system generated and consulted
- [ ] Typography is **NOT** Inter (use Space Grotesk + Instrument Sans)
- [ ] Color palette from design system (NOT generic blue gradients)
- [ ] Micro-interactions: 150-300ms timing, cubic-bezier easing
- [ ] Mobile-first, responsive
- [ ] Accessibility: contrast ≥4.5:1, keyboard nav, aria-labels
- [ ] Touch targets ≥44px, spacing ≥8px
- [ ] No emoji icons (use SVG: Heroicons, Lucide)
- [ ] Loading/error/empty states

---

## 2. Brand Identity

### Visual Identity

**Logo**: "cadans." (lowercase + period)
- Font: Instrument Serif (italic)
- Color: Cadans Indigo (#4F46E5) on dark, black on light

**Pulse Motif**: • • ● ● ● • • (seven dots, sine-wave opacity)

**Color Palette**:
- Primary: Cadans Indigo (#4F46E5) — CTAs, headings
- Secondary: Signal Teal (#0D9488) — success states
- Text: Ink (#0F172A) on Canvas (#FAFAF8)

**Typography**:
- Display: **Space Grotesk** 500-700 (headings)
- Body: **Instrument Sans** 400-600 (paragraphs)
- Accent: **Instrument Serif** italic (logo, emphasis)
- Code: JetBrains Mono 400 (stats, code)

**NOT**: Inter, generic fonts, emoji icons

### Voice & Tone

**Taglines**:
- English: "AI agents that keep your business in rhythm."
- Dutch: "Jouw agent houdt de cadans."

**Communication**:
- Direct, clear, practical
- Dutch for emotion, English for technical clarity
- No jargon, real examples only
- "Je" (informal) for landing, "U" (formal) for contracts

**Anti-Voice** (NEVER):
- "Leverage", "synergize", "cutting-edge", "revolutionize"
- Excessive emojis (max 1 per message)
- Generic marketing speak

### Target Audience

**Dutch MKB owners**:
- 40-60 years old
- Overwhelmed by email/admin
- Uses WhatsApp daily
- Privacy-conscious (GDPR compliance is a selling point)
- Values Dutch directness: no fluff, get to the point

---

## 3. Development Standards

### Frontend

**Tech Stack**:
- HTML/CSS/JS (no framework bloat for landing pages)
- Deploy: Cloudflare Pages
- Images: WebP/AVIF, lazy loading
- Mobile-first, responsive

**Requirements**:
- Semantic HTML, accessible markup
- Touch targets ≥44px, spacing ≥8px
- Contrast ≥4.5:1
- Keyboard navigation

### Backend/Service

**Framework**: NanoClaw (Node.js, 500 lines)
- Claude Agent SDK
- Model routing: Haiku 4.5 (fast, cheap) + Sonnet 4.6 (smart, expensive)
- WhatsApp Business API
- Hetzner VPS (EU-hosted, GDPR-compliant)

**Container Architecture**:
- Docker per client (isolated namespace, dedicated volume)
- Resource limits: 1GB RAM, 1 vCPU
- Mounts: /data, /config, /logs
- Health checks for monitoring

### Core Files (The "5 Files That Run the Business")

1. **CLAUDE.md.template** (200+ lines) — Persona engineering for Dutch MKB
2. **client-config.example.yaml** (~100 lines) — Discovery call → system config
3. **deploy.sh** (~250 lines) — One-command deployment
4. **model-router.ts** (~250 lines) — Cost optimization (Haiku/Sonnet routing)
5. **README.md** — Operations manual

Location: `/root/cadans/templates/`

---

## 4. Quick Reference

### File Structure

```
cadans/
├── CLAUDE.md                    # This file (high-level instructions)
├── BUSINESS-STRATEGY.md         # Market, pricing, personas, roadmap
├── DEPLOYMENT-OPERATIONS.md     # 5-day workflow, scaling, costs
├── LEGAL-COMPLIANCE.md          # GDPR, EU AI Act, contracts
├── ui-ux-pro-max/              # UI/UX design system (MANDATORY)
│   ├── SKILL.md
│   ├── design-system/
│   │   ├── MASTER.md
│   │   └── pages/
│   └── scripts/
├── brand/                      # Visual assets
│   ├── logo-variations/
│   ├── cadans-brand-guide.md
│   └── voice-guidelines.md
├── docs/                       # Technical documentation
│   └── technical/
├── templates/                  # Deployment system (5 files)
│   ├── CLAUDE.md.template
│   ├── client-config.example.yaml
│   ├── deploy.sh
│   ├── model-router.ts
│   └── README.md
├── clients/                    # Per-client deployments
└── scripts/                    # Business operations
```

### Common Commands

```bash
# Generate design system for new page
cd /root/cadans/ui-ux-pro-max
python3 scripts/search.py "saas professional premium" --design-system --persist -p "Cadans" --page "landing"

# Deploy new client
./templates/deploy.sh configs/client-name.yaml

# Check client API costs
cat /opt/cadans/clients/client-slug/logs/usage.jsonl | jq -s 'map(.cost_eur) | add'

# Haiku vs Sonnet split
cat usage.jsonl | jq -s 'group_by(.model) | map({model: .[0].model, count: length})'
```

### Anti-Patterns (AVOID)

**Design**:
- ❌ Basic Inter font without thoughtful pairing
- ❌ Generic blue gradients, template-like designs
- ❌ Emoji icons (🚀 ⚙️) instead of SVG
- ❌ Skipping UI/UX Pro Max design system
- ❌ Random spacing (must use 4px/8px scale)
- ❌ Poor contrast (<4.5:1)

**Development**:
- ❌ Framework overkill for simple pages
- ❌ Unoptimized images (use WebP/AVIF + lazy loading)
- ❌ Missing viewport meta
- ❌ Inaccessible forms (no labels, poor errors)
- ❌ Storing sensitive data unencrypted

**Business/Content**:
- ❌ Tech jargon without explanation
- ❌ Generic marketing speak ("revolutionize", "cutting-edge")
- ❌ Ignoring Dutch cultural context
- ❌ Vague promises without concrete examples
- ❌ Under-pricing (maintain 70%+ gross margin)

---

## 5. Success Metrics

**Month 1**:
- [ ] First paying client (€2,500 setup)
- [ ] Client active (10+ messages in 3 days)

**Month 3**:
- [ ] 5-8 clients deployed
- [ ] First vertical upsell (Cadans Collect)
- [ ] Gross margin >80%

**Month 6**:
- [ ] 15-25 clients
- [ ] Deployment specialist hired
- [ ] €4,500-7,500 MRR
- [ ] First boekhouder partnership

**Year 1**:
- [ ] 40 clients
- [ ] €120K ARR + €100K setup fees

---

## 6. Key Workflows

### Creating a New Landing Page

1. **Generate design system** (REQUIRED)
   ```bash
   cd /root/cadans/ui-ux-pro-max
   python3 scripts/search.py "saas business professional" --design-system --persist -p "Cadans" --page "landing"
   ```

2. **Read design system**
   - Check `design-system/MASTER.md`
   - Check `design-system/pages/landing.md` (if exists)

3. **Implement UI**
   - Use recommended typography (NOT Inter)
   - Apply color palette from design system
   - Follow spacing scale (4px/8px)
   - Add micro-interactions (150-300ms)
   - Ensure accessibility

4. **Review against Pre-Delivery Checklist** (§1)

5. **Deploy** via Cloudflare Pages

### Client Deployment (5-Day Workflow)

See [DEPLOYMENT-OPERATIONS.md](DEPLOYMENT-OPERATIONS.md) for full details.

**Day 1**: Discovery call (60 min) → Fill client-config.yaml
**Day 2**: Deploy (30 min) → Run deploy.sh, pair WhatsApp
**Day 3**: Customize (90 min) → Tune email rules with client
**Day 4**: Test (60 min) → Run 20+ test messages
**Day 5**: Handover (45 min) → Train client, first digest

**Success**: Client sends 10+ messages in first 3 days

---

## Documentation

- **Business**: [BUSINESS-STRATEGY.md](BUSINESS-STRATEGY.md) — Market opportunity, pricing, personas, product roadmap
- **Operations**: [DEPLOYMENT-OPERATIONS.md](DEPLOYMENT-OPERATIONS.md) — 5-day workflow, scaling, cost tracking, hiring
- **Legal**: [LEGAL-COMPLIANCE.md](LEGAL-COMPLIANCE.md) — GDPR (4-layer encryption), EU AI Act, contracts
- **UI/UX**: [ui-ux-pro-max/SKILL.md](ui-ux-pro-max/SKILL.md) — Complete design system guide
- **Technical**: [docs/technical/](docs/technical/) — Model routing, deployment examples

---

**Built with**: [NanoClaw](https://github.com/your-repo/nanoclaw) | **Target Market**: Netherlands → EU

*De cadans van je bedrijf. ✅*
