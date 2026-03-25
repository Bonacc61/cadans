# Custom Agent Framework

## Overview

The Custom agent framework provides a structured approach to building bespoke AI solutions for clients with unique workflows that don't fit our standard products (PA, Books, Collect, Support).

---

## When to Build Custom

**Criteria:**
- Client needs span multiple verticals (e.g., PA + Books + industry-specific logic)
- >5 integrations required
- Multi-step workflows with complex branching
- Strategic value: Client willing to pay €10K+ setup, €1K+/mo recurring
- Competitive moat: Solution creates lock-in, upsell opportunities

**Examples:**
- Real estate agent (viewings + bids + notary + mortgage)
- Recruiter (CV screening + interviews + reference checks)
- Construction coordinator (subcontractor scheduling + material orders + permits)
- Medical practice (appointments + insurance + prescriptions + NEN 7510)
- Event planner (venue + vendors + RSVPs + invoicing)

---

## Development Process (9 Weeks)

### Week 1: Discovery

**Kickoff call** (2 hours):
- Understand workflows, pain points, current tools
- Identify 3-5 core workflows to automate
- Determine success metrics

**Process mapping** (Miro board):
- Document each workflow step-by-step
- Identify decision points, edge cases
- Map to existing Cadans skills where possible

**Integration audit**:
- Which platforms need API access?
- Check API availability (REST/SOAP/webhooks)
- Test auth methods (OAuth, API key, scraping as fallback)

**Deliverable:** Workflow diagram + integration feasibility report

---

### Week 2: Design

**Skill architecture:**
- Which skills to build from scratch?
- Which skills to adapt from existing agents?
- Data flow between skills
- State management strategy

**Integration specs:**
- API endpoints, payloads, error handling
- Rate limits, retry logic
- Data mapping (platform → agent → platform)

**User interface:**
- WhatsApp command structure
- Email trigger patterns
- Dashboard (if needed)

**Edge case handling:**
- What could go wrong?
- Fallback strategies
- Human-in-the-loop checkpoints

**Deliverable:** Technical spec (10-15 pages) + prototype mockups

---

### Week 3-6: Build

**Incremental delivery:**
- Week 3: Core workflow #1 (highest value)
- Week 4: Core workflow #2
- Week 5: Core workflow #3 + integrations
- Week 6: Refinement, error handling, logging

**Development approach:**
- Build skills in `/root/cadans/agents/custom/{client-slug}/skills/`
- Use `custom_skill_template.md` as starting point
- Test in sandbox environment (client's test accounts)
- Security audit: GDPR compliance, encryption, access controls

**Deliverable:** Working MVP (2-3 workflows operational)

---

### Week 7-8: Pilot

**Supervised usage:**
- Agent runs, but alerts owner before taking actions
- User approves each automation (HITL mode)
- Collect feedback: "Dit werkte goed" / "Dit moet anders"

**Iteration:**
- Fix bugs immediately
- Refine prompts (tone, accuracy)
- Add missing edge cases
- Performance tuning

**Deliverable:** Production-ready agent (ready for unsupervised mode)

---

### Week 9: Handover

**Documentation:**
- User manual (WhatsApp commands, email triggers)
- Command reference (quick lookup)
- Troubleshooting guide (common errors + fixes)

**Training session** (2 hours):
- Walkthrough with client team
- Demo all workflows
- Q&A

**Support plan:**
- How to request changes (email, WhatsApp, GitHub issues)
- How to report bugs (severity levels)
- How to scale usage (add team members, increase limits)

**Review meeting:**
- What worked, what didn't
- Roadmap for v2 (enhancements, new workflows)

**Deliverable:** Live agent + documentation + 30-day support

---

## Project Structure

```
/root/cadans/agents/custom/{client-slug}/
├── config/
│   ├── agent.json                 # Agent metadata, pricing, integrations
│   └── settings.json              # Per-client configuration
├── skills/
│   ├── {workflow_1}.md           # Skill definition
│   ├── {workflow_2}.md
│   └── {workflow_3}.md
├── templates/
│   ├── whatsapp/
│   │   ├── {template_1}.txt
│   │   └── {template_2}.txt
│   ├── email/
│   │   ├── {template_1}.txt
│   │   └── {template_2}.txt
│   └── sms/
│       └── {template_1}.txt
├── integrations/
│   ├── {platform_1}_api.md       # API docs + example requests
│   ├── {platform_2}_api.md
│   └── auth/
│       ├── oauth_tokens.enc      # Encrypted OAuth tokens
│       └── api_keys.enc          # Encrypted API keys
├── data/
│   ├── db/
│   │   └── {client-slug}.db      # SQLite database
│   ├── files/
│   │   ├── invoices/
│   │   ├── contracts/
│   │   └── temp/
│   └── logs/
│       └── agent.log              # Append-only audit log
├── scripts/
│   ├── deploy.sh                  # Deployment script
│   ├── backup.sh                  # Daily backup (7-year retention)
│   └── migrate.sh                 # Schema migrations
└── README.md                      # Client-specific documentation
```

---

## Pricing Model

### Setup Fees (One-time)

| Complexity | Integrations | Workflows | Price Range |
|------------|--------------|-----------|-------------|
| Simple     | 1-2          | 3-5       | €4,000-6,000 |
| Medium     | 3-5          | 5-10      | €7,000-12,000 |
| Complex    | 6+           | 10+       | €15,000-25,000 |

**Add-ons:**
- GDPR audit (NEN 7510 for healthcare): +€2,000
- White-label reseller setup: +€3,000
- Mobile app integration: +€5,000

---

### Monthly Recurring

**Base:** €500-2,000/mo (depends on complexity, API costs, usage volume)

**Includes:**
- Hosting (Hetzner VPS, EU region)
- API costs (pass-through + 10% margin)
- Monitoring & alerts
- Bug fixes
- Minor updates

**Maintenance:** 10% of setup fee annually (major feature updates)

**Enhancements:** Hourly rate (€150/hr) or project-based

---

### Revenue Share (Alternative)

For high-impact workflows (e.g., sales automation):

**Structure:** 10-20% of incremental revenue + €500/mo base

**Example:**
- Recruiter places 2 extra candidates/month → €10K revenue → €1K-2K fee
- Real estate agent closes 1 extra deal/quarter → €15K commission → €1.5K-3K fee

---

## Common Integration Patterns

### 1. REST API Integration

**Pattern:** OAuth 2.0 + JSON payloads

**Example: Salesforce**
```javascript
const getSalesforceLeads = async () => {
  const token = await refreshOAuthToken('salesforce', clientId);
  const response = await fetch('https://api.salesforce.com/services/data/v56.0/query?q=SELECT+Id,Name+FROM+Lead', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

---

### 2. Webhook Receiver

**Pattern:** Express.js endpoint + signature verification

**Example: Stripe payment webhook**
```javascript
app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

  if (event.type === 'payment_intent.succeeded') {
    await handlePaymentSuccess(event.data.object);
  }

  res.json({ received: true });
});
```

---

### 3. Email Scraping (when no API exists)

**Pattern:** IMAP + regex extraction

**Example: Booking confirmations**
```javascript
const parseBookingEmail = (emailBody) => {
  const bookingIdMatch = emailBody.match(/Booking ID: (\w+)/);
  const dateMatch = emailBody.match(/Date: (\d{2}-\d{2}-\d{4})/);
  return {
    bookingId: bookingIdMatch[1],
    date: dateMatch[1]
  };
};
```

---

### 4. File Watcher

**Pattern:** Chokidar + processing queue

**Example: Invoice processing**
```javascript
const watcher = chokidar.watch('/opt/cadans/clients/{slug}/data/incoming/', {
  persistent: true
});

watcher.on('add', async (path) => {
  if (path.endsWith('.pdf')) {
    await processInvoice(path);
  }
});
```

---

## Testing Strategy

### Unit Tests

**Test individual skills in isolation:**

```javascript
// Test: Real estate viewing scheduler
test('schedules viewing when property available', async () => {
  const result = await scheduleViewing({
    propertyId: 'P12345',
    requestedDate: '2026-04-01',
    requestedTime: '14:00'
  });

  expect(result.status).toBe('confirmed');
  expect(result.calendareventId).toBeDefined();
});
```

---

### Integration Tests

**Test API integrations with sandbox accounts:**

```javascript
// Test: Exact Online invoice creation
test('creates invoice in Exact Online sandbox', async () => {
  const invoice = await createExactInvoice({
    customerId: 'TEST_CUSTOMER',
    amount: 100.00,
    description: 'Test invoice'
  });

  expect(invoice.invoiceNumber).toMatch(/TEST-\d+/);
});
```

---

### End-to-End Tests

**Test full workflows in staging environment:**

```
Scenario: Real estate agent receives viewing request via WhatsApp

Given: Property "Kerkstraat 12" is available
When: Client sends "Ik wil graag bezichtigen op vrijdag 14:00"
Then:
  - Calendar checked for Friday 14:00
  - If available → Viewing scheduled
  - Confirmation sent to client
  - Agent receives WhatsApp notification
  - Google Calendar event created
```

---

## Deployment

### Production Setup

**Server:** Hetzner VPS (CPX31: 4 vCPU, 8GB RAM, €15/mo)

**Location:** Falkenstein, Germany (EU GDPR compliance)

**Stack:**
- Ubuntu 22.04 LTS
- Node.js 20 LTS
- PM2 (process manager)
- Nginx (reverse proxy)
- SQLite (local database)
- Docker (optional, for isolated environments)

**Deployment:**
```bash
cd /root/cadans/agents/custom/{client-slug}
./scripts/deploy.sh production
```

**Monitoring:**
- PM2 monitoring dashboard
- Email alerts on crashes
- Daily backup to Hetzner Storage Box (€5/mo for 1TB)

---

## Security Checklist

Before production deployment:

- [ ] All credentials encrypted (AES-256)
- [ ] No API keys in code (use environment variables)
- [ ] HTTPS only (Let's Encrypt SSL)
- [ ] Rate limiting on webhooks (prevent DDoS)
- [ ] Input validation (prevent injection attacks)
- [ ] Audit logging (append-only, immutable)
- [ ] GDPR compliance audit (data retention, encryption, access controls)
- [ ] Regular backups (daily + 7-year retention)

---

## Support Tiers

### Standard (Included in monthly fee)

- Bug fixes (resolved within 3 business days)
- Email support (response within 24h)
- Monthly usage report
- Security updates

### Premium (+€200/mo)

- Priority bug fixes (resolved within 24h)
- WhatsApp support (response within 4h)
- Weekly check-in calls
- Proactive monitoring (alerts before failures)

### Enterprise (+€500/mo)

- 24/7 support
- Dedicated Slack channel
- Quarterly strategy reviews
- Custom feature development (10 hours/month included)

---

## Example Custom Agents

### 1. Real Estate Agent

**Workflows:**
- Viewing scheduler (calendar sync + client confirmation)
- Bid tracker (highest bid alerts, deadline reminders)
- Notary coordinator (find available slot, book appointment)
- Mortgage pre-approval (parse bank statements, calculate DTI)

**Pricing:** €8,000 setup + €1,200/mo

---

### 2. Recruiter Pipeline Manager

**Workflows:**
- CV screening (parse PDF, match job requirements, score candidates)
- Interview scheduler (multi-party coordination)
- Reference checks (auto-send templates, remind after 3 days)
- Candidate follow-up (track pipeline stage, send updates)

**Pricing:** €6,000 setup + €600/mo

---

### 3. Construction Project Coordinator

**Workflows:**
- Subcontractor scheduling (cascade reschedules, conflict detection)
- Material order tracking (supplier APIs, delivery delays)
- Permit status (municipality website scraper, alert when approved)
- Photo documentation (tag by room, date, contractor)

**Pricing:** €8,000 setup + €1,200/mo (3 concurrent projects)

---

## Anti-Patterns

- ❌ Never build custom when standard product fits (always upsell standard first)
- ❌ Never promise delivery dates without buffer (9 weeks minimum)
- ❌ Never skip discovery phase (40% of failures = misaligned expectations)
- ❌ Never hardcode client data (always use config files)
- ❌ Never deploy without backup strategy (7-year retention required)
- ❌ Never forget revenue share cap (max 20% to prevent runaway costs)

---

## Success Metrics

**Track per custom agent:**
- Time saved (hours/month)
- Error rate (% of automations requiring human intervention)
- ROI (12-month payback period target)
- Client satisfaction (NPS quarterly)
- Retention (96% after 12 months target)

**Report quarterly** to client.

---

## Roadmap

**Q2 2026:**
- Build 3 reference custom agents (real estate, recruiter, construction)
- Document common integration patterns

**Q3 2026:**
- Create "Custom Agent Starter Kit" (templates, integration library)
- Offer white-label option (resellers, consultancies)

**Q4 2026:**
- Marketplace for pre-built industry agents (€2K-5K, no customization)
- Self-service custom agent builder (drag-and-drop workflows)

**Q1 2027:**
- AI-generated custom agents (describe workflow → agent generated in 1 week)
