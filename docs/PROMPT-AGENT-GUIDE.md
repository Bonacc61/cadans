# Claude Web App Prompt: AI Agent Development Guides

**Purpose:** Generate 60-120 page implementation guides for Cadans vertical agents (Receptionist, Customer Service, Sales, Bookkeeper) using Claude Code + RALPH loops.

Copy the entire prompt below into Claude web app to generate a comprehensive, production-ready PDF guide.

---

## MASTER PROMPT

You are an expert AI consultant specializing in agentic AI systems built on Claude Agent SDK and NanoClaw. Create a **60-120 page implementation guide** for deploying vertical AI agents following consultant-style methodology: discovery call → YAML config → automated deployment script.

### Context: Cadans Ecosystem

- **NanoClaw Framework**: Personal Claude assistant in Docker containers
- **Cadans PA**: Base product - WhatsApp AI for email/agenda/tasks (€250-500/mo)
- **Dev Method**: Claude Code + RALPH loops (Research → Architect → Loop → Handover → Polish)
- **Deployment**: 5-day consulting process with YAML-driven automation
- **Revenue**: Vertical agent upsells (+€150-800/mo per agent)
- **The Moat**: CLAUDE.md template refined across 40+ deployments = unreplicatable IP

### Choose ONE Agent:

1. **AI Receptionist** (1-2 weeks dev)
2. **AI Customer Service** (2-3 weeks)
3. **AI Sales Assistant** (3-5 weeks)
4. **AI Bookkeeper** (6-10 weeks)

---

## Required Structure (15 Sections)

### 1. Executive Summary (2-3 pages)
- One-sentence value prop
- Target customer profile
- Revenue model (setup + monthly)
- Dev timeline (hours + weeks)
- Cost to build (AI inference, APIs, tools)
- ROI timeline (clients to break even)

### 2. Discovery Call Template (4-6 pages)
**60-minute structured interview:**
- Pre-call prep checklist
- 10-15 opening questions (pain points, tools, workflows, compliance, success metrics)
- 5-10 technical questions (email/CRM/calendar/messaging/auth)
- Edge case exploration
- Closing & next steps

**Output: YAML config template**

### 3. YAML Configuration Schema (6-10 pages)
Complete annotated template:
```yaml
client:
  name: "Company Name"
  industry: "SaaS"
  country: "NL"
  language: "nl"

agent:
  name: "Emma"
  role: "Sales Assistant"
  tone: "professional-friendly"

integrations:
  email: {provider: "gmail", credentials: "..."}
  crm: {provider: "hubspot", api_key: "..."}
  calendar: {provider: "google_calendar", booking_rules: [...]}

rules:
  triage: {urgent_keywords: [...], vip_contacts: [...]}
  approval_required: [...]

scheduled_tasks:
  - {name: "morning_digest", time: "07:30", timezone: "Europe/Amsterdam"}
```
- Field definitions (purpose, data type, validation)
- 3-5 real-world examples (different industries)
- Validation schema

### 4. CLAUDE.md System Prompt Template (10-15 pages)
**The core IP** - agent's "brain":
- Persona definition (name, role, tone)
- Core capabilities (can/cannot do)
- Email triage rules (urgent/normal/spam)
- Dutch business etiquette (formal "u" vs. informal "je")
- Approval flows (when to ask human)
- Security constraints (PII handling, GDPR)
- Contact intelligence (learn preferences)
- Edge case handling (voice notes, multi-language, ambiguous requests)
- Error recovery (API failures, missing context)
- Formatting conventions

**Use placeholders:** `{{CLIENT_NAME}}`, `{{INDUSTRY}}`, `{{TONE}}`

### 5. Deployment Script (deploy.sh) (8-12 pages)
Fully annotated Bash script:
1. Validate prerequisites (Docker, Node.js, yq, API keys)
2. Parse YAML config
3. Generate CLAUDE.md (substitute placeholders)
4. Create .env file
5. Docker Compose setup
6. Configure scheduled tasks
7. Initialize database (SQLite schema)
8. Test integrations (OAuth, webhooks)
9. Generate QA checklist
10. Output handover docs

**Error handling:** Fail fast, idempotent, rollback on failure

### 6. Integration Guides (12-20 pages)
Step-by-step for each API:
- Gmail/Google Workspace (OAuth 2.0)
- Microsoft Outlook (Azure AD)
- Google Calendar (booking logic)
- CRM (HubSpot/Salesforce/Pipedrive)
- Exact Online (Dutch accounting)
- WhatsApp Business API
- Slack/Teams

**Each guide:** Prerequisites, setup steps, code snippets, testing, errors, rate limits

### 7. RALPH Loop Development Plan (8-10 pages)
5-7 RALPH iterations with hour estimates.

**Example (AI Sales Assistant):**
- Loop 1: Research & Architecture (4-8h) - APIs, frameworks, data model
- Loop 2: Email Triage (8-12h) - Parsing, classification, urgency detection
- Loop 3: CRM Integration (6-10h) - Write operations, error handling
- Loop 4: Lead Qualification (8-12h) - BANT framework, scoring
- Loop 5: Email Drafting (6-10h) - Templates, tone matching
- Loop 6: Calendar (4-6h) - Slot detection, timezone handling
- Loop 7: Polish & QA (6-10h) - End-to-end testing, optimization

**Total: 42-68 hours (1.5-2.5 weeks)**

### 8. CLAUDE.md Refinement Strategy (6-8 pages)
How to evolve the template post-deployment:
1. Week 1-2: Daily client check-ins
2. Collect failure cases (misclassified, wrong tone, API errors)
3. Extract patterns ("offerte" = HIGH priority for Dutch clients)
4. Update template (version control, A/B testing)
5. After 40 deployments: 200+ edge cases, industry-specific rules, cultural nuances

### 9. QA Testing Checklist (5-7 pages)
20-30 tests before handover:
- **Email Triage (8-10):** Urgent triggers, spam filtering, multi-language, CC/BCC logic
- **Calendar (5-7):** Auto-confirm, conflict detection, timezone, cancellations
- **CRM (5-7):** Create contact, update fields, deal stages, activity log
- **Behavior (5-7):** Approval requests, error handling, privacy, tone matching
- **Performance (2-3):** Morning digest timing, API response time, scheduled tasks

**Each test:** Setup, expected behavior, actual behavior, pass/fail, notes

### 10. Pricing & Revenue Model (4-6 pages)
- **COGS:** AI inference (€X-Y), infrastructure (€1.50-2.50), APIs (€Z), support (€10-20)
- **Pricing Tiers:** Standard/Plus/Enterprise (€X, €X+150, €X+300/mo)
- **Setup Fees:** €2,500-4,000 (discovery, deployment, Day 3 customization)
- **ROI Justification:** Client saves Z hours/mo × €H hourly rate = €K value, ROI = K/X×
- **Break-even:** Dev cost (€W) ÷ clients/month = P months

### 11. Operations Manual (8-10 pages)
**5-Day Deployment:**
- Day 0-1: Discovery call, fill YAML, send SOW
- Day 2: Run deploy.sh, verify integrations, monitoring
- Day 3: Walk through WhatsApp, test scenarios, tune rules
- Day 4-5: Handover doc, schedule Month 1 call, enable alerts

**Monthly Optimization Call (30 min):** Metrics review, feedback, refine rules, upsell

**QBR (Enterprise):** ROI analysis, roadmap, vertical agent upsells

### 12. GDPR & Compliance (6-8 pages)
- **DPA:** Processor/controller, data categories
- **Encryption:** 4 layers (WhatsApp E2E, TLS 1.3, Docker volumes, LUKS at-rest)
- **Right to Erasure:** Script to delete all client data
- **Data Export:** JSON dump script
- **Retention:** 90 days (messages), 30 days (logs), 7/4/12 (backups)
- **Subprocessors:** Anthropic, Google, CRM vendor, Hetzner (EU)
- **Incident Response:** 72-hour breach notification

### 13. Competitive Differentiation (3-5 pages)
**vs. Zapier:** No NLU, brittle logic | **Your agent:** Contextual intelligence
**vs. Generic chatbots:** Web dashboard | **Your agent:** WhatsApp-native (87% Dutch daily use)
**vs. VA:** €2K-3.5K/mo, limited hours | **Your agent:** €250-500/mo, 24/7
**vs. Competitors:** Generic templates | **Your moat:** CLAUDE.md refined across 40+ deployments

**Switching cost:** After 6 months, agent has learned 50+ contact preferences + industry rules

### 14. Success Metrics & KPIs (4-5 pages)
**Client metrics:** Time saved, response time, accuracy %, engagement (messages/day)
**Internal metrics:** AI cost/client, approval rate %, error rate, churn risk (days since last message)
**Dashboard:** Daily stats script (messages handled, AI cost, approval rate, avg response time)

### 15. Roadmap & Future Features (3-4 pages)
- **Phase 1 (M1-3):** Core agent stable with 5-10 clients
- **Phase 2 (M4-6):** First vertical upsell, V2 features
- **Phase 3 (M7-12):** Second vertical, channel partnerships (boekhouders)
- **Phase 4 (Y2):** Platform, API, marketplace
- **Backlog:** Voice calls (Twilio), multi-agent orchestration, predictive analytics

---

## Output Requirements

**Format:**
- 60-120 pages minimum
- Markdown (convert to PDF via Claude web app)
- Production-ready code (copy-paste deployable)
- Consultant-grade (could sell as $5K deliverable)

**Style:**
- H1/H2/H3 hierarchy
- Code blocks (bash, yaml, typescript) with syntax highlighting
- Tables (comparisons, pricing, timelines)
- Mermaid diagrams (architecture, flowcharts, sequences, Gantt charts)
- Callout boxes: `> ⚠️ **WARNING**: Never commit API keys`

**Voice:**
- Dutch business culture (direct, pragmatic, no fluff)
- Consultant tone (professional, teach don't preach)
- Developer-friendly (show code first, explain after)
- ROI-focused (tie features to client value and revenue)

---

## Special Instructions

1. **Be EXHAUSTIVE:** Production-ready scripts, complete configs, full code. Developer should copy-paste and deploy.

2. **Dutch market focus:** Dutch SMEs (MKB), Dutch-language examples in CLAUDE.md, Dutch tools (Exact Online, Mollie).

3. **Real-world edge cases:** Show EXACTLY what to do when:
   - Gmail API returns 429 (rate limit)
   - Voice note in Dutch with background noise
   - Email thread with 15 participants (who to reply-all?)
   - Calendar conflict during client meeting (can't ask approval)

4. **ROI obsession:** Every feature justifies existence ("saves X hours/month" or "unlocks €Y upsell").

5. **Visual diagrams (Mermaid):**
   - Architecture: containers, APIs, databases
   - Flowcharts: email triage, approval flows
   - Sequences: WhatsApp → Agent → Claude → Gmail → Client
   - Gantt: RALPH timeline, 5-day deployment

6. **Reference Cadans PA:** This vertical agent integrates seamlessly (same YAML format, deploy.sh patterns, Docker architecture).

---

## Final Checklist

- [ ] All 15 sections complete (60+ pages)
- [ ] YAML config with 3+ real-world examples
- [ ] CLAUDE.md 350+ lines with placeholders
- [ ] deploy.sh fully functional (Ubuntu 22.04 + macOS)
- [ ] 5+ integration guides (OAuth step-by-step)
- [ ] RALPH plan (5-7 iterations, hour estimates)
- [ ] QA checklist (20+ tests, expected behaviors)
- [ ] Pricing model (full COGS, break-even)
- [ ] Operations manual (5-day deployment, monthly calls)
- [ ] GDPR section (erasure script, DPA template)
- [ ] 3+ Mermaid diagrams
- [ ] Proper syntax highlighting (bash, yaml, typescript, markdown)
- [ ] Consultant-grade formatting ($5K deliverable quality)

---

## Now Generate

**Choose which agent to document:**
1. AI Receptionist
2. AI Customer Service  
3. AI Sales Assistant
4. AI Bookkeeper

Generate the complete 60-120 page guide following the structure above.

After completion, I'll use this with Claude Code to build the agent in 1-2 weeks, deploy to 3-5 clients in month 1, and scale to €8K-12K MRR by month 6.

Let's build.

---

**END OF PROMPT**
