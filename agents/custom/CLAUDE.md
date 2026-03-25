# Custom Agent - Development Guide

**Agent Type:** Bespoke Solutions (Dynamic skill architecture)
**Complexity:** Highest (client-specific workflows, multiple integrations, custom logic)
**Last Updated:** 2026-03-22

---

## Purpose

Custom agents are fully tailored solutions for clients whose workflows don't fit standard products (PA, Books, Collect, Support). **Every custom agent is unique** — this guide provides development patterns, not specific workflows.

---

## When to Build Custom (Decision Criteria)

**Build custom IF:**
- ✅ Client needs span multiple verticals (e.g., PA + Books + industry-specific logic)
- ✅ >5 integrations required
- ✅ Multi-step workflows with complex branching logic
- ✅ Client willing to pay €10K+ setup, €1K+/mo recurring
- ✅ Solution creates competitive moat (lock-in, strategic value)

**Use standard product IF:**
- ❌ Client needs fit within PA/Books/Collect/Support scope
- ❌ <3 integrations
- ❌ Budget <€5K setup

**Rule:** Always upsell standard products first. Custom is premium tier.

---

## Development Process (9 Weeks - FIXED)

### Week 1: Discovery

**Deliverables:**
- Workflow diagram (Miro board, 3-5 core workflows)
- Integration feasibility report (API availability, auth methods)
- Success metrics definition (time saved, error reduction, ROI)

**Activities:**
1. Kickoff call (2 hours): Understand pain points, current tools
2. Process mapping: Document step-by-step workflows
3. Integration audit: Test API endpoints in sandbox
4. Define scope: Which workflows in MVP, which in v2

**NEVER proceed without signed-off workflow diagram.**

---

### Week 2: Design

**Deliverables:**
- Technical spec (10-15 pages)
- Prototype mockups (WhatsApp command flows)

**Contents:**
- Skill architecture (which skills from scratch, which adapted)
- Data flow diagram (platform A → agent → platform B)
- Integration specs (endpoints, payloads, error handling)
- Edge case handling (fallback strategies, HITL checkpoints)

**Review with client:** Confirm approach before coding.

---

### Week 3-6: Build (Incremental)

**Deliverables:**
- Week 3: Core workflow #1 (highest value)
- Week 4: Core workflow #2
- Week 5: Core workflow #3 + integrations
- Week 6: Refinement + error handling + logging

**Development location:**
```
/root/cadans/agents/custom/{client-slug}/
├── config/
│   ├── agent.json
│   └── settings.json
├── skills/
│   ├── {workflow_1}.md
│   ├── {workflow_2}.md
│   └── {workflow_3}.md
├── templates/
│   ├── whatsapp/
│   ├── email/
│   └── sms/
├── integrations/
│   ├── {platform_1}_api.md
│   └── auth/
├── data/
│   ├── db/{client-slug}.db
│   └── logs/agent.log
└── README.md
```

---

### Week 7-8: Pilot (Supervised Mode)

**Deliverables:**
- Production-ready agent (unsupervised mode enabled)

**Process:**
1. Deploy to staging environment
2. Agent runs, but alerts owner before actions (HITL mode)
3. User approves each automation
4. Collect feedback: "Dit werkte goed" / "Dit moet anders"
5. Iterate: Fix bugs, refine prompts, add missing edge cases

**Exit criteria:** 90% approval rate (user says "yes" without edits)

---

### Week 9: Handover

**Deliverables:**
- User manual (WhatsApp commands, email triggers)
- Training session (2 hours with client team)
- 30-day support plan

**Activities:**
1. Documentation: Command reference, troubleshooting guide
2. Training: Walkthrough + Q&A
3. Support setup: How to request changes, report bugs
4. Review meeting: What worked, what didn't, v2 roadmap

---

## Common Integration Patterns

### Pattern 1: REST API Integration (OAuth 2.0)

**Example:** Salesforce, HubSpot, Shopify

```javascript
const callAPI = async (endpoint, method = 'GET', body = null) => {
  const token = await refreshOAuthToken('{PLATFORM_NAME}');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : null
  });

  if (response.status === 401) {
    // Token expired, refresh and retry
    const newToken = await refreshOAuthToken('{PLATFORM_NAME}', true);
    return callAPI(endpoint, method, body); // Retry once
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
```

**Error handling:**
- ✅ Retry on 401 (token expired)
- ✅ Respect rate limits (429 → wait + retry)
- ✅ Log all API calls (audit trail)
- ❌ NEVER expose tokens in logs

---

### Pattern 2: Webhook Receiver

**Example:** Stripe payments, Calendly bookings

```javascript
app.post('/webhooks/{client-slug}/{platform}', async (req, res) => {
  // Verify signature (MANDATORY for security)
  const signature = req.headers['{SIGNATURE_HEADER}'];
  const isValid = verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process event
  const event = req.body;
  await handleEvent(event.type, event.data);

  // Acknowledge receipt immediately (prevent retries)
  res.json({ received: true });
});
```

**ALWAYS verify signatures** (prevents spoofed webhooks)

---

### Pattern 3: Email Scraping (No API Available)

**Example:** Booking confirmations, shipping notifications

```javascript
const parseEmail = (emailBody, emailSubject) => {
  // Regex extraction (fragile, but necessary when no API)
  const bookingIdMatch = emailBody.match(/Booking ID: (\w+)/);
  const dateMatch = emailBody.match(/Date: (\d{2}-\d{2}-\d{4})/);
  const amountMatch = emailBody.match(/Total: €(\d+\.\d{2})/);

  if (!bookingIdMatch || !dateMatch || !amountMatch) {
    // Parsing failed → Alert human
    alertUser('Email parsing failed', { subject: emailSubject });
    return null;
  }

  return {
    bookingId: bookingIdMatch[1],
    date: parseDate(dateMatch[1]),
    amount: parseFloat(amountMatch[1])
  };
};
```

**Use only when:**
- ❌ No API available
- ✅ Email format is stable (doesn't change often)
- ✅ Parsing errors alert human (never fail silently)

---

### Pattern 4: File Watcher

**Example:** Invoice uploads, contract signatures

```javascript
const chokidar = require('chokidar');

const watcher = chokidar.watch('/opt/cadans/clients/{client-slug}/data/incoming/', {
  persistent: true,
  ignoreInitial: true
});

watcher.on('add', async (filePath) => {
  if (filePath.endsWith('.pdf')) {
    const metadata = await extractPDFMetadata(filePath);

    if (metadata.type === 'invoice') {
      await processInvoice(filePath, metadata);
    } else if (metadata.type === 'contract') {
      await processContract(filePath, metadata);
    }

    // Move to processed folder
    await fs.rename(filePath, `/opt/cadans/clients/{client-slug}/data/processed/${path.basename(filePath)}`);
  }
});
```

---

## Security Checklist (MANDATORY)

Before production deployment:

- [ ] All credentials encrypted (AES-256)
- [ ] No API keys in code (use environment variables)
- [ ] HTTPS only (Let's Encrypt SSL)
- [ ] Webhook signature verification implemented
- [ ] Rate limiting on webhooks (prevent DDoS)
- [ ] Input validation (prevent injection attacks)
- [ ] Audit logging (append-only, immutable)
- [ ] GDPR compliance audit (data retention, encryption, access controls)
- [ ] Regular backups (daily + 7-year retention)
- [ ] OAuth tokens rotated (never long-lived)

---

## GDPR Compliance (Per-Client)

### Data Retention

**Configure per client:**
```json
{
  "gdpr": {
    "retention_policy": {
      "customer_data": "{1-7}_years", // [CONFIGURABLE]
      "conversation_logs": "{1-3}_years",
      "api_logs": "90_days",
      "financial_records": "7_years" // [FIXED BY DUTCH LAW]
    },
    "data_subject_rights": {
      "access": true,  // Right to access
      "rectification": true, // Right to correct
      "erasure": true, // Right to delete (after retention period)
      "portability": true // Right to export
    }
  }
}
```

---

### Data Processing Agreement (DPA)

**MUST sign DPA with every custom client:**

**Template location:** `/root/cadans/legal/DPA-template.md`

**Key clauses:**
- Cadans is "processor", client is "controller"
- Data stored in EU (Hetzner Germany)
- Sub-processors listed (OpenAI, cloud providers)
- Breach notification within 72h
- Client can audit data handling annually

---

## Testing Strategy

### Unit Tests

**Test individual skills in isolation:**

```javascript
// Example: Real estate viewing scheduler
test('schedules viewing when property available', async () => {
  const result = await scheduleViewing({
    propertyId: 'P12345',
    requestedDate: '2026-04-01',
    requestedTime: '14:00'
  });

  expect(result.status).toBe('confirmed');
  expect(result.calendarEventId).toBeDefined();
  expect(result.confirmationSent).toBe(true);
});
```

---

### Integration Tests (Sandbox)

**Test API integrations:**

```javascript
test('creates invoice in Exact Online sandbox', async () => {
  const invoice = await createExactInvoice({
    customerId: 'TEST_CUSTOMER',
    amount: 100.00,
    description: 'Test invoice'
  });

  expect(invoice.invoiceNumber).toMatch(/TEST-\d+/);
  expect(invoice.status).toBe('Draft');
});
```

**NEVER test in production** (use sandbox accounts)

---

### End-to-End Tests (Staging)

**Test full workflows:**

```
Scenario: Real estate agent receives viewing request

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

## Configuration Placeholders (Per-Client)

### agent.json

```json
{
  "agent_id": "custom-{client-slug}",
  "client_name": "{CLIENT_COMPANY_NAME}",
  "industry": "{INDUSTRY}", // e.g., "real_estate", "recruitment", "construction"
  "setup_fee": {SETUP_FEE}, // €4,000-25,000
  "monthly_fee": {MONTHLY_FEE}, // €500-2,000
  "integrations": [
    {
      "platform": "{PLATFORM_NAME}", // e.g., "Salesforce"
      "api_base_url": "{API_URL}",
      "auth_method": "{oauth2|api_key|basic}",
      "credentials": {
        "oauth_refresh_token": "{ENCRYPTED}",
        "api_key": "{ENCRYPTED}"
      }
    }
  ],
  "workflows": [
    {
      "name": "{WORKFLOW_NAME}",
      "description": "{WORKFLOW_DESCRIPTION}",
      "skill_file": "skills/{workflow_name}.md"
    }
  ],
  "channels": ["whatsapp", "email"], // [CONFIGURABLE]
  "language": "nl", // [OPTIONS: nl, en]
  "support_tier": "enterprise", // [standard, premium, enterprise]
  "deployment": {
    "server": "hetzner_vps",
    "location": "falkenstein_de",
    "environment": "production"
  }
}
```

---

### settings.json (Runtime Config)

```json
{
  "working_hours": {
    "start": "09:00",
    "end": "18:00",
    "timezone": "Europe/Amsterdam"
  },
  "notification_preferences": {
    "whatsapp": "{PHONE_NUMBER}",
    "email": "{EMAIL_ADDRESS}",
    "urgency_threshold": "high" // [low, medium, high]
  },
  "feature_flags": {
    "auto_approve_actions": false, // [HITL mode by default]
    "send_daily_summary": true,
    "log_all_api_calls": true
  },
  "custom_settings": {
    // Client-specific settings go here
    "{SETTING_NAME}": "{SETTING_VALUE}"
  }
}
```

---

## Anti-Patterns (NEVER DO THIS)

### Development Mistakes
- ❌ NEVER skip discovery phase (40% of failures = misaligned expectations)
- ❌ NEVER promise delivery <9 weeks (quality requires time)
- ❌ NEVER build custom when standard product fits (upsell standard first)
- ❌ NEVER skip signed-off workflow diagram (scope creep guaranteed)
- ❌ NEVER deploy without pilot phase (bugs will exist)

### Technical Errors
- ❌ NEVER hardcode client data (always use config files)
- ❌ NEVER skip error handling (assume APIs will fail)
- ❌ NEVER expose credentials in logs
- ❌ NEVER test in production (use sandbox)
- ❌ NEVER skip OAuth refresh logic (tokens expire)

### Business Mistakes
- ❌ NEVER forget revenue share cap (max 20% to prevent runaway costs)
- ❌ NEVER deploy without backup strategy (7-year retention required)
- ❌ NEVER skip DPA (GDPR requires processor agreement)

---

## Success Metrics (Track Quarterly)

**Per custom agent:**
- Time saved: {X} hours/month
- Error rate: {Y}% (automations requiring human intervention)
- ROI: {Z} months to payback
- Client satisfaction (NPS): {SCORE}
- Retention: {%} after 12 months

**Report quarterly** to client + internal review.

---

## Support & Maintenance

**Per-client setup:**

```json
{
  "owner": "{DEVELOPER_NAME}",
  "client_contact": {
    "name": "{CLIENT_NAME}",
    "email": "{CLIENT_EMAIL}",
    "phone": "{CLIENT_PHONE}"
  },
  "support_tier": "{standard|premium|enterprise}",
  "sla": {
    "bug_fix_time": "{3_days|24h|4h}", // Depends on tier
    "response_time": "{24h|4h|1h}",
    "uptime_guarantee": "99.5%" // [CONFIGURABLE]
  },
  "maintenance_schedule": {
    "monthly_check_in": true, // [CONFIGURABLE]
    "quarterly_review": true,
    "annual_strategy_session": true
  }
}
```

---

## Roadmap Template

**Per-client roadmap:**

```markdown
## {CLIENT_NAME} Custom Agent Roadmap

### v1.0 (Week 9 - Live)
- ✅ Workflow 1: {NAME}
- ✅ Workflow 2: {NAME}
- ✅ Workflow 3: {NAME}

### v1.1 (Month 2)
- 🔄 Enhancement: {DESCRIPTION}
- 🔄 Bug fix: {DESCRIPTION}

### v2.0 (Quarter 2)
- 📅 New workflow: {NAME}
- 📅 New integration: {PLATFORM}

### v3.0 (Year 2)
- 💡 AI feature: {DESCRIPTION}
```

---

## Changelog Template

```markdown
## Changelog

### v1.0.0 (2026-03-22)
- Initial release
- Workflow 1: {NAME}
- Workflow 2: {NAME}
- Integration: {PLATFORM_1}, {PLATFORM_2}

### v1.0.1 (2026-04-05)
- Bug fix: {DESCRIPTION}
- Enhancement: {DESCRIPTION}

### v1.1.0 (2026-05-12)
- New feature: {DESCRIPTION}
- Integration: {NEW_PLATFORM}
```

---

## Support & Maintenance

**Owner:** [DEVELOPER_NAME - PLACEHOLDER]
**Client contact:** [CLIENT_EMAIL - PLACEHOLDER]
**Support tier:** [Enterprise - FIXED FOR CUSTOM]

**Known issues:** [CLIENT-SPECIFIC]

**Roadmap:** [CLIENT-SPECIFIC]

---

## Final Checklist

Before marking custom agent as "production-ready":

- [ ] All 9 weeks completed (discovery → handover)
- [ ] Client signed off on final deliverables
- [ ] Security checklist passed (encryption, HTTPS, no exposed credentials)
- [ ] GDPR DPA signed
- [ ] Backup strategy implemented (daily + 7-year retention)
- [ ] Monitoring alerts configured (downtime, errors)
- [ ] Documentation complete (user manual, troubleshooting guide)
- [ ] Training session delivered (2 hours with client team)
- [ ] 30-day support plan active
- [ ] Success metrics baseline established (track improvement)

**Only mark as done when ALL checkboxes checked.**
