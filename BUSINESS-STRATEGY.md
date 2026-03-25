# Cadans Business Strategy

*Extracted from Implementation Guide – Comprehensive business and operational details*

---

## Table of Contents

1. [Market Opportunity](#1-market-opportunity)
2. [Target Personas](#2-target-personas)
3. [Pricing Strategy](#3-pricing-strategy)
4. [Unit Economics](#4-unit-economics)
5. [Competitive Positioning](#5-competitive-positioning)
6. [Product Roadmap](#6-product-roadmap)
7. [Channel Partnerships](#7-channel-partnerships)

---

## 1. Market Opportunity

### 1.1 TAM/SAM/SOM Model

**Total Addressable Market (TAM)**:
- 350,000 Dutch SMEs (1-250 FTE) where owner handles email/scheduling personally
- Blended price: €250/mo average (PA Standard)
- **TAM: 350K × €250/mo = €86M ARR potential**

**Serviceable Addressable Market (SAM)**:
- Qualifier: Uses Gmail/Google Calendar + WhatsApp daily + spends >€1,000/yr on admin or loses >5hrs/week
- 80,000 digitally literate MKB owners
- **SAM: 80K × €250/mo = €24M ARR**

**Serviceable Obtainable Market (SOM)**:
- **Year 1**: 40 clients (solo founder capacity: 3 new clients/month after 2-month ramp)
- **Year 2**: 120 clients (+ 1 part-time deployment specialist hired Month 5)

### 1.2 Revenue Projections

**Year 1**:
- 40 clients × €250/mo = **€120K ARR** + €100K setup fees = **€220K total revenue**
- COGS: €28-52/client/mo
- Gross margin: 73-91%

**Year 2**:
- 120 clients × €300/mo (mix of Standard + vertical upsells) = **€360K ARR** + €300K setup fees = **€660K total revenue**
- Net margin: 50-60% after founder + deployment specialist

### 1.3 EU Expansion Opportunity (Post-Validation)

**Belgium** (780K freelancers, Dutch-speaking Flanders): Natural first expansion
- Adaptation needed: Minimal (same language, similar business culture)
- Market entry: LinkedIn targeting Belgian ZZP'ers, Ghent/Antwerp business networks

**Germany** (3.9M freelancers, Mittelstand culture): Largest pool
- Adaptation needed: Full German persona engineering (formal "Sie" vs informal "du" calibration)
- Market entry: Partner with German Steuerberater (equivalent of boekhouder)

**At 0.01% EU capture: 1,700 clients × €250/mo ≈ €5M ARR**

---

## 2. Target Personas

### 2.1 Persona 1: MKB-Eigenaar (Primary Buyer)

**Demographics**:
- 35-55 years old
- Business owner, 1-25 FTE
- Services/trade/professional practice

**Psychographics**:
- Operationally overwhelmed
- Can't justify €2,500/mo human PA
- Tech-comfortable (uses Gmail, WhatsApp daily)

**Pain Points**:
- Loses 2+ hours/day to email/calendar/admin
- Misses client follow-ups
- Sticky-note chaos

**Purchase Trigger**:
- Missed a critical deadline
- Client complaint about slow response

**Willingness to Pay**:
- €200-500/mo (€2,500 setup feels expensive but ROI is obvious during demo)

**Market Size**: 350,000 firms in Netherlands

**Sales Channel**: LinkedIn content, personal network referrals, boekhouder channel

---

### 2.2 Persona 2: Senior ZZP'er (Secondary Buyer)

**Demographics**:
- 40-60 years old
- Independent consultant/interim manager
- Billing €100-200/hr

**Psychographics**:
- Time = money mindset
- Every hour on admin is €100-200 lost revenue

**Pain Points**:
- 30% of week is non-billable (proposals, invoicing, client comms)
- Inconsistent virtual PA quality

**Purchase Trigger**:
- Calculates exact billable hours lost to admin per month (€4,000-8,000)

**Willingness to Pay**:
- €100-250/mo (lower than MKB-Eigenaar because they're cost-sensitive, but demo converts via ROI)

**Market Size**: 200,000 high-earning freelancers

**Sales Channel**: ZZP communities (Reddit, Slack), LinkedIn targeting interim professionals

---

### 2.3 Persona 3: Boekhouder (Channel Partner, Not End User)

**Demographics**:
- Accounting/advisory practice owner
- 20-60 client administrations

**Psychographics**:
- Drowning in data entry
- Can't hire due to talent shortage (41% cite this)
- Loyal client relationships

**Pain Points**:
- 70% of time on manual categorization
- Turns away new clients due to capacity

**Purchase Trigger**:
- Lost a client because quarterly filing was late
- Reached capacity limit

**Willingness to Pay**:
- €500/mo per practice (to handle data entry across all clients, enabling 30% more capacity)

**Market Size**: 25,000 small accounting practices

**Sales Channel**: Direct outreach to practices managing €150-500K annual revenue

---

## 3. Pricing Strategy

### 3.1 Pricing Tiers

| Tier | Setup Fee | Monthly | Features | Target Buyer |
|------|-----------|---------|----------|--------------|
| **PA Standard** | €2,500 | €250 | Email triage, calendar, tasks, research | Straightforward MKB owners |
| **PA Plus** | €4,000 | €350 | + Morning briefing, meeting prep, EOD summary | Senior ZZP'ers billing €100+/hr |
| **PA Enterprise** | €6,000 | €500 | + Multi-channel (Slack, Teams), custom skills, CRM integration | 10-25 FTE companies |

### 3.2 Vertical Agent Upsells

| Agent | Monthly Fee | Target Pain Point |
|-------|-------------|-------------------|
| **Cadans Collect** | +€150-300 | Invoice chase (late payments) |
| **Cadans Books** | +€200-500 | Bookkeeping (receipt categorization, BTW) |
| **Cadans Support** | +€300-800 | Customer service (WhatsApp inquiries) |

### 3.3 Pricing Decision Matrix

| Signal | Recommend |
|--------|-----------|
| "I just need help with email and calendar" | PA Standard (€250) |
| "I want a summary every morning before I start" | PA Plus (€350) |
| Client bills >€100/hr, mentions time = money | PA Plus (€350) |
| "Can it work with Slack/Teams, not just WhatsApp?" | PA Enterprise (€500) |
| 10-25 FTE company, needs multi-user support | PA Enterprise (€500) |
| Client asks "Can it chase invoices?" during discovery | Upsell Cadans Collect (+€200) |
| Client mentions "I hate doing my bookkeeping" | Upsell Cadans Books (+€300) |

### 3.4 Upsell Triggers (After Deployment)

- PA detects 10+ overdue invoices in monthly digest → Suggest Collect
- Client mentions receipts/BTW during optimization call → Suggest Books
- Client asks "Can it handle customer questions?" → Suggest Support

---

## 4. Unit Economics

### 4.1 Per-Client Costs (Monthly)

| Cost Component | Amount |
|----------------|--------|
| Infrastructure (VPS allocation) | €1.50-2.50 |
| AI inference (Haiku/Sonnet mix) | €3-15 |
| WhatsApp (dedicated number, if applicable) | €5-10 |
| Support/ops (amortized monthly calls) | €10-20 |
| **Total COGS** | **€28-52/mo** |

### 4.2 Gross Margin by Tier

| Tier | Revenue | COGS | Gross Margin |
|------|---------|------|--------------|
| Standard | €250/mo | €40/mo | **84%** |
| Plus | €350/mo | €45/mo | **87%** |
| Enterprise | €500/mo | €52/mo | **90%** |

### 4.3 Lifetime Value (LTV)

**Assumption**: 24-month average retention (based on high-touch consulting model)

| Tier | Calculation | LTV |
|------|-------------|-----|
| Standard | €250/mo × 24 + €2,500 setup | **€8,500** |
| Plus | €350/mo × 24 + €4,000 setup | **€12,400** |
| With vertical upsells | €500/mo × 24 + €5,000 setup | **€17,000** |

### 4.4 Customer Acquisition Cost (CAC)

| Channel | CAC | LTV/CAC Ratio |
|---------|-----|---------------|
| Organic (referrals, LinkedIn) | ~€0 (founder time only) | ∞ |
| Paid (LinkedIn ads, if used) | €200-500/client | 17-42× |

**Target**: <€500 CAC
**LTV/CAC ratio**: €8,500 / €250 = **34×** (excellent; >3× is healthy for SaaS)

---

## 5. Competitive Positioning

### 5.1 Dutch AI Automation Agencies (as of March 2026)

**Current Landscape**:
- Most founded 2024-2025 (nascent market)
- Services: Zapier/Make workflows, chatbot deployment, RPA consulting
- **Gaps**: No one sells done-for-you WhatsApp AI assistants to MKB via consulting model
- Pricing: €5K-20K project fees, **no recurring revenue** (one-time implementations)

### 5.2 Cadans Differentiation

| Dimension | Competitors | Cadans |
|-----------|-------------|--------|
| **Revenue model** | One-time project fees (€5K-20K) | Recurring revenue (€250-500/mo) |
| **Interface** | Web chatbots, email workflows | WhatsApp-first (87% of Dutch use daily) |
| **Persona engineering** | Generic chatbot personalities | Dutch business etiquette, tone, communication patterns |
| **Deployment model** | "Here's a chatbot link" | 5-day consulting process with customization |
| **Privacy** | Standard access controls | Operator can't read client data (4-layer encryption) |

### 5.3 Competitive Moat (After 40 Clients)

**Proprietary Assets**:
1. **CLAUDE.md.template** contains 40+ clients worth of Dutch business communication patterns
2. **Email triage rules** refined across hundreds of real inboxes
3. **Contact intelligence** behavioral patterns (response times, communication preferences)
4. **Model routing optimization** (Haiku/Sonnet split reduces costs 20-60%)

**Defensibility**: No competitor can replicate this without identical deployment history

---

## 6. Product Roadmap

### 6.1 Core Product: Cadans PA (Personal Assistant)

**MVP Features**:
1. **Email Triage**: 3-tier categorization (ACTION / INFO / SKIP)
2. **Calendar Management**: Schedule meetings, respect focus blocks, buffer times
3. **Task Capture**: Auto-capture from casual conversation ("ik moet nog de bank bellen")
4. **Research**: Web search, information gathering
5. **Email Drafting**: Generate replies in client's tone of voice
6. **Contact Intelligence**: Learn response times, communication preferences

**Interface**: WhatsApp (primary), bilingual (Dutch/English)

### 6.2 Vertical Agent Portfolio (Scored)

#### Cadans Books — Bookkeeping Agent (Score: 92/100)

**Market demand**: 25/25
- ZZP'ers pay €80-200/mo for bookkeeping
- BVs pay €150-500/mo
- Boekhouders need capacity unlock (can't hire due to talent shortage)

**Build speed**: 23/25
- Requires: Moneybird/Exact API, BTW logic, receipt parsing
- Timeline: 6-8 weeks

**Pricing power**: 24/25
- €200-500/mo per client
- €500/mo for boekhouder channel sales

**Competitive edge**: 20/25
- InvoiceGhost IP provides head start on invoice parsing + payment detection

**Features**:
- Receipt capture via email/WhatsApp (OCR with Claude Vision)
- Expense categorization (learns client's chart of accounts)
- Bank reconciliation (Bunq, ING, Rabobank integration)
- BTW preparation (quarterly returns formatted for Belastingdienst)
- Integration with existing PA for proactive nudges

**Target buyers**:
- Segment A: Boekhouders (25K practices × €500/mo = €12.5M TAM)
- Segment B: MKB owners (350K firms × €150/mo = €52.5M TAM)

**Revenue model**: €3K-8K setup + €200-500/mo per client

---

#### Cadans Collect — Invoice Chase Agent (Score: 90/100)

**Market demand**: 22/25
- Every freelancer hates chasing late payments
- The "awkward email" damages client relationships

**Build speed**: 25/25
- Core IP already exists from InvoiceGhost research
- Timeline: 2-3 weeks to deploy

**Pricing power**: 18/25
- €150-300/mo (lower than Books because narrower use case)

**Competitive edge**: 25/25
- InvoiceGhost payment detection + chase sequence logic is proprietary

**Features**:
- Invoice sending with payment tracking
- Automated chase sequences: Friendly reminder (7 days) → Firmer nudge (14 days) → Escalation (21 days)
- WhatsApp notifications to client
- Dutch business etiquette templates

**Target buyers**: ZZP'ers and small BVs who send 5-20 invoices/month

**Revenue model**: €2K-5K setup + €150-300/mo per client

---

#### Cadans Support — Customer Service Agent (Score: 86/100)

**Market demand**: 24/25
- 41% of Dutch SMEs cite talent pressure (can't hire support staff)

**Build speed**: 20/25
- WhatsApp Business API + knowledge base integration
- Timeline: 4-6 weeks

**Pricing power**: 22/25
- €300-800/mo depending on message volume

**Competitive edge**: 20/25
- WhatsApp-first support is uncommon in NL (most use email/phone)

**Features**:
- WhatsApp business number for customer inquiries
- Knowledge base: FAQ, product docs, pricing
- Agent answers 80% of questions autonomously
- Escalation: Complex questions forwarded to owner via PA
- Multi-language: Dutch + English
- Analytics: Daily summary of inquiry types, sentiment

**Target buyers**: E-commerce shops, SaaS companies, service businesses

**Revenue model**: €5K-15K setup + €300-800/mo per client

---

### 6.3 6-Month Product Timeline

```
Month 1-2: Cadans PA (MVP) — Beta clients, refinement
Month 2-3: Cadans Collect — First vertical upsell
Month 3-5: Cadans Books — Highest revenue potential
Month 4-6: Cadans Support — Enterprise tier, multi-channel

Milestones:
- Month 1: First PA paying client (€2,500 setup)
- Month 2: First Collect upsell (€400 additional MRR from existing PA client)
- Month 4: First Books deployment to boekhouder (€500/mo)
- Month 6: Full vertical stack deployed (PA + Collect + Books = €1,050/mo per client)
```

**Revenue Stacking**:
- PA €250 → +Collect €300 → +Books €500 = **€1,050/mo per client**

---

## 7. Channel Partnerships

### 7.1 Boekhouder (Accounting Firm) Partnerships

**Why boekhouders are the highest-leverage channel**:
- **Referral multiplier**: Sell to 1 firm → reach 20-60 end clients
- **Trust transfer**: 76% of Dutch SMEs report "extremely high loyalty" to their boekhouder
- **Natural upsell path**: PA client → Boekhouder suggests Cadans Books → Client already trusts Cadans brand
- **Capacity unlock**: Firms using Cadans Books can take 30% more clients without hiring

### 7.2 Partnership Model

**Tier 1: Referral-only**
- Boekhouder refers clients to Cadans PA, no revenue share
- Relies on goodwill (helps their clients save time)

**Tier 2: Co-branded deployment**
- Boekhouder's clients get "Powered by Cadans" branding
- Practice pays €500/mo for Cadans Books white-label

**Tier 3: Revenue share**
- Boekhouder refers PA clients
- Receives 10-20% recurring commission

### 7.3 Outreach Strategy

**Month 4**: Identify 20 practices via KvK search
- Criteria: 1-3 employees, €150-500K revenue, active LinkedIn presence

**Month 4-5**: Cold LinkedIn + email
- "We help boekhouders take 30% more clients without hiring. 30-min demo?"

**Month 5**: Pilot with 2 practices
- Deploy Cadans Books, measure time saved on data entry

**Month 6**: Case study + referral program launch

**Target: 3-5 boekhouder partnerships by Month 6, each referring 10-20 PA clients over 12 months**

---

**Next**: See [DEPLOYMENT-OPERATIONS.md](DEPLOYMENT-OPERATIONS.md) for deployment system and scaling details.
