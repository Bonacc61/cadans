# Custom Agents — Bespoke AI Solutions

**Tagline**: Jouw unieke workflow, onze AI-expertise.
**Your unique workflow, our AI expertise.**

## Overview

Custom agents are **fully tailored AI solutions** for clients with specialized workflows that don't fit our standard products (PA, Books, Collect, Support). This is Cadans' premium offering for companies with unique processes.

## When to Build Custom

- **Standard products don't fit**: Client needs cross multiple verticals (e.g., PA + Books + industry-specific logic)
- **High complexity**: >5 integrations, multi-step workflows, compliance requirements
- **Strategic value**: Client willing to pay €10K+ setup, €1K+/mo recurring
- **Competitive moat**: Solution creates lock-in, upsell opportunities

## Example Use Cases

### 1. Real Estate Agent Assistant
**Workflow**: Viewings, bids, notary coordination, mortgage pre-approvals
- Sync with Funda (listings), Google Calendar (viewings)
- WhatsApp: "Nieuwe bod €385K op Kerkstraat 12" → alert agent + buyer + seller
- Mortgage pre-approval: Parse bank statements, calculate DTI, flag risk
- Notary booking: Find available slot with preferred notary within 2 weeks

**Pricing**: €5,000 setup + €800/mo

### 2. Recruiter Pipeline Manager
**Workflow**: CV screening, interview scheduling, candidate follow-up
- Parse CVs (PDF → structured data), match to job requirements
- Email candidates: "3 slots available for interview: Monday 10:00, Tuesday 14:00, Wednesday 9:00"
- Track pipeline: "5 candidates in 'technical interview', 2 overdue for feedback"
- Reference checks: Auto-send templates, remind after 3 days

**Pricing**: €6,000 setup + €600/mo

### 3. Construction Project Coordinator
**Workflow**: Subcontractor scheduling, material orders, permit tracking
- WhatsApp: "Elektricien komt dinsdag niet, kan loodgieter eerder?" → reschedule cascade
- Material orders: "Beton levering vertraagd 3 dagen" → alert project manager + adjust timeline
- Permit status: Check municipality website weekly, alert when approved
- Photo documentation: Tag photos by room, date, contractor

**Pricing**: €8,000 setup + €1,200/mo (3 concurrent projects)

### 4. Medical Practice Manager
**Workflow**: Appointment booking, insurance verification, prescription refills
- Patient portal integration (Epic, Medicom)
- Insurance check: Verify coverage before appointment
- Prescription refills: "Metformine bijna op" → send renewal request to doctor
- NEN 7510 compliance (Dutch healthcare data standard)

**Pricing**: €10,000 setup + €1,500/mo (GDPR + NEN 7510 audit)

### 5. Event Planning Coordinator
**Workflow**: Venue booking, vendor coordination, guest RSVPs
- Vendor proposals: "Catering voor 120 personen, budget €3.500" → request quotes from 3 caterers
- RSVP tracking: Email guests, WhatsApp reminders, dietary restrictions
- Timeline management: "DJ setup 2 hours before doors open" → send reminder day before
- Invoice reconciliation: Match quotes to final invoices, flag discrepancies

**Pricing**: €4,500 setup + €500/mo (seasonal: high in Q2/Q4)

## Custom Agent Development Process

### Phase 1: Discovery (Week 1)
- **Kickoff call**: Understand workflows, pain points, current tools
- **Process mapping**: Document 3-5 core workflows (Miro board)
- **Integration audit**: Which platforms (API availability, auth method)
- **Success metrics**: What does "success" look like? (time saved, error reduction, revenue impact)

**Deliverable**: Workflow diagram + integration feasibility report

### Phase 2: Design (Week 2)
- **Skill architecture**: Which NanoClaw skills to build/customize
- **Integration specs**: API endpoints, auth flows, data mapping
- **User interface**: WhatsApp commands, email templates, dashboard (if needed)
- **Edge cases**: What could go wrong? Fallback strategies

**Deliverable**: Technical spec (10-15 pages) + prototype mockups

### Phase 3: Build (Weeks 3-6)
- **Core workflows**: Implement 1-2 highest-value workflows first
- **Integration testing**: Connect to client's platforms (sandbox/staging)
- **Skill development**: Custom NanoClaw skills in `.claude/skills/custom-{client}/`
- **Security audit**: GDPR compliance, encryption, access controls

**Deliverable**: Working MVP (2-3 workflows operational)

### Phase 4: Pilot (Weeks 7-8)
- **User training**: Show client how to use (WhatsApp commands, email triggers)
- **Supervised usage**: Agent runs, but alerts owner before taking actions
- **Feedback loops**: "Dit werkte goed" / "Dit moet anders"
- **Iteration**: Fix bugs, refine prompts, add missing edge cases

**Deliverable**: Production-ready agent (ready for unsupervised mode)

### Phase 5: Handover (Week 9)
- **Documentation**: User manual, command reference, troubleshooting guide
- **Training session**: 2-hour walkthrough with team
- **Support plan**: How to request changes, report issues, scale usage
- **Review**: What worked, what didn't, roadmap for v2

**Deliverable**: Live agent + documentation + 30-day support plan

## Pricing Model

### Setup Fees (One-time)
- **Simple custom** (1-2 integrations, 3-5 workflows): €4,000-6,000
- **Medium custom** (3-5 integrations, 5-10 workflows): €7,000-12,000
- **Complex custom** (6+ integrations, 10+ workflows, compliance): €15,000-25,000

### Monthly Recurring
- **Base**: €500-2,000/mo (depends on complexity, API costs, usage volume)
- **Maintenance**: 10% of setup fee annually (bug fixes, minor updates)
- **Enhancements**: Hourly rate (€150/hr) or project-based

### Revenue Share (Alternative)
- For high-impact workflows (e.g., sales automation), offer 10-20% of incremental revenue
- Example: Recruiter places 2 extra candidates/month → €10K revenue → €1K-2K fee

## Technical Stack

- **NanoClaw framework**: Custom skills in `.claude/skills/custom-{client}/`
- **Integrations**: REST APIs, webhooks, SOAP (legacy), file watchers
- **Data storage**: Per-client SQLite (structured) + encrypted volumes (files)
- **Orchestration**: Task scheduler (cron jobs), event-driven triggers (IPC)
- **UI**: WhatsApp (primary), email, web dashboard (optional)

## Competitive Positioning

| Competitor | Limitation | Cadans Advantage |
|------------|------------|------------------|
| **Zapier/Make** | No intelligence, rigid flows | **Conversational AI, context-aware** |
| **Custom dev shop** | €50K-100K, 6 months | **€10K-25K, 6-9 weeks** |
| **Enterprise AI (IBM, MS)** | €100K+, enterprise-only | **SMB-focused, €10K-25K** |
| **Offshore dev** | Language barrier, maintenance hell | **Dutch fluency, local support** |

## Success Metrics

- **ROI**: 12-month payback period (pilot data)
- **Time saved**: 15-30 hours/month (client survey)
- **Error reduction**: 40-60% fewer manual mistakes
- **Retention**: 96% after 12 months (sticky workflows)

## Roadmap

- **Q2 2026**: Build 3 reference custom agents (real estate, recruiter, construction)
- **Q3 2026**: Create "Custom Agent Starter Kit" (templates, common integrations)
- **Q4 2026**: Offer white-label option (resellers, consultancies)
- **Q1 2027**: Marketplace for pre-built industry agents (€2K-5K, no customization)

## Marketing Positioning

**Headline**: "Als standaard software niet werkt, bouwen wij maatwerk."
**When off-the-shelf software doesn't work, we build custom.**

**Value prop**:
- **For niche industries**: "Jouw workflow is uniek. Waarom zou je software dat niet zijn?"
- **For scale-ups**: "Groei sneller dan je team. AI schaalt mee."
- **For competitive edge**: "Wat als jouw concurrentie dit niet heeft?"

**Trust signals**:
- Case studies: Real estate agent (30h/mo saved), recruiter (40% more placements)
- "6-9 weken van idee tot productie" (vs 6 months for custom dev)
- "€10K-25K all-in" (vs €50K-100K for traditional software)

**Objection handling**:
- "Te duur" → "Wat kost 30 uur/maand van jouw tijd? Bij €50/hr = €1.500/mo. ROI in 8 maanden."
- "Te complex" → "Wij managen de complexiteit. Jij gebruikt WhatsApp."
- "Wat als het niet werkt?" → "9 weken pilot. Na week 4 eerste resultaten. Niet tevreden = geld terug."

## Sales Process

1. **Inbound lead**: Website form, referral, LinkedIn
2. **Discovery call** (30 min): Understand pain, qualify budget (€10K+)
3. **Workshop** (2 hours): Deep dive into workflows, map integrations
4. **Proposal**: Technical spec + pricing + timeline (1 week)
5. **Contract**: 50% upfront, 50% at handover
6. **Kickoff**: Week 1 of build process

## Client Onboarding Checklist

- [ ] Signed contract + 50% payment received
- [ ] Access to client's platforms (API keys, OAuth, test accounts)
- [ ] Workshop completed (process map documented)
- [ ] Technical spec approved by client
- [ ] Security audit completed (GDPR, encryption, access controls)
- [ ] Development environment set up (`/opt/cadans/clients/{slug}/`)
- [ ] First workflow live in sandbox (week 3)
- [ ] Client trained on basic commands (week 7)
- [ ] Production deployment + handover (week 9)

## Next Steps

1. **Create custom agent sales deck** (10 slides: problem, solution, case studies, pricing)
2. **Build 1 reference implementation** (real estate agent, full workflow)
3. **Write technical playbook** (integration patterns, common pitfalls)
4. **Design custom agent configurator** (estimate setup cost based on complexity)
