# Transferable Components Analysis

**From:** `/root/NanoClaw` and `/root/olorin`
**To:** `/root/cadans`
**Date:** 2026-03-22

---

## Executive Summary

This document identifies reusable components from NanoClaw (framework) and Olórin (recruitment SaaS) that are transferable to Cadans (AI agent consultancy).

**Highly Transferable:**
1. ✅ GDPR Anonymization Layer (complete PII separation)
2. ✅ Event Bus (typed lifecycle events)
3. ✅ Design System Persistence (MASTER.md pattern)
4. ✅ HITL (Human-in-the-Loop) System
5. ✅ DPIA Generator (Data Protection Impact Assessment)

**Partially Transferable:**
6. ⚠️ Inference Filter (AI output validation - adapt for agents)
7. ⚠️ LIA Generator (Legitimate Interest Assessment - adapt for marketing)

**Not Transferable:**
8. ❌ Recruitment-specific code (candidate scoring, vacancy matching)

---

## 1. GDPR Anonymization Layer

### Location
- **Source:** `/root/NanoClaw/gdpr/` and `/root/olorin/compliance/gdpr/`
- **Target:** `/root/cadans/compliance/gdpr/`

### What It Does

**ZERO PII to Claude API** - Ensures Claude NEVER receives personally identifiable information.

**Key Features:**
- Dual-layer encryption (SQLCipher database + Fernet application-level)
- Deterministic searchable encryption (HMAC digests for reverse lookup)
- Automated GDPR rights handling (Access, Erasure, Objection)
- Configurable retention (default: 180 days, Cadans needs 7 years for financial data)
- Immutable audit trail

**Architecture:**
```
Raw Data (PII) → Anonymize → Claude API (anonymous UUIDs only)
                ↓
        Encrypted Storage (local)
                ↓
Claude Response ← Rehydrate ← PII merged back after evaluation
```

---

### Why Cadans Needs This

**Agents handle sensitive client data:**
- **Personal Assistant:** Email content, calendar events, contact details
- **Books:** Invoices, client names, bank IBANs
- **Collect:** Debtor contact info, payment history
- **Support:** Customer conversations, order details

**GDPR compliance is MANDATORY:**
- Art. 15: Right to access (export all data)
- Art. 17: Right to erasure (delete on request)
- Art. 21: Right to object (do-not-contact flag)
- 7-year retention for financial data (Dutch tax law)

---

### How to Transfer

**Step 1: Copy entire GDPR module**
```bash
cp -r /root/NanoClaw/gdpr /root/cadans/compliance/gdpr
```

**Step 2: Install dependencies**
```bash
cd /root/cadans
pip install -r compliance/gdpr/requirements.txt
```

**Dependencies:**
- `pysqlcipher3` - Encrypted SQLite database
- `cryptography` - Fernet encryption for application-level fields

**Step 3: Generate encryption keys**
```bash
# Fernet key (application-level encryption)
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Database passphrase
python3 -c "import secrets, base64; print(base64.b64encode(secrets.token_bytes(32)).decode())"
```

**Step 4: Configure environment variables**
```bash
export CADANS_DB_PATH="/var/lib/cadans/client-data.db"
export CADANS_DB_PASSPHRASE="<strong-passphrase-from-step-3>"
export CADANS_FERNET_KEY="<fernet-key-from-step-3>"
export CADANS_RETENTION_DAYS="2555"  # 7 years = 2555 days (Dutch tax law)
```

**Step 5: Update config.py for Cadans**
```python
# compliance/gdpr/config.py
class GDPRConfig:
    def __init__(self):
        self.db_path = os.getenv('CADANS_DB_PATH', '/var/lib/cadans/client-data.db')
        self.db_passphrase = os.getenv('CADANS_DB_PASSPHRASE')
        self.fernet_key = os.getenv('CADANS_FERNET_KEY')
        self.retention_days = int(os.getenv('CADANS_RETENTION_DAYS', '2555'))  # 7 years
```

---

### Usage in Cadans Agents

**Personal Assistant (Email Triage):**
```python
from compliance.gdpr import GDPRConfig, MappingStore, Anonymizer

# Initialize
config = GDPRConfig()
mapping_store = MappingStore(config.db_path, config.db_passphrase, config.fernet_key, config.retention_days)
anonymizer = Anonymizer(mapping_store)

# Anonymize email before sending to Claude
raw_email = {
    'from': 'jan@bakkerij.nl',
    'subject': 'Offerte website',
    'body': 'Hoi, kunnen jullie een offerte sturen...'
}

anon_email, internal_id = anonymizer.anonymize(raw_email, source="client-123-email")

# Send to Claude (ZERO PII)
draft_reply = claude_draft_reply(anon_email)

# Rehydrate after Claude
full_result = anonymizer.rehydrate([{
    'internal_id': internal_id,
    'draft': draft_reply
}], actor="pa-agent")

# full_result now has: original email + draft reply
```

**Books (Invoice Creation):**
```python
# Anonymize client data before AI processing
raw_client = {
    'name': 'Bakkerij de Vries BV',
    'email': 'info@bakkerij-devries.nl',
    'iban': 'NL12ABNA0123456789'
}

anon_client, client_id = anonymizer.anonymize(raw_client, source="client-123-books")

# Claude only sees: UUID, generic category ("food_retail")
# NEVER sees actual name, email, IBAN
```

---

### Adaptation Requirements

**Change retention period:**
- NanoClaw/Olórin: 180 days (recruitment industry standard)
- Cadans: 2555 days (7 years, Dutch tax law for financial data)

**Update field mapping:**
```python
# OLD (recruitment):
anonymized = {
    'uuid': generate_uuid(),
    'programming_languages': candidate['languages'],
    'contribution_score': candidate['contributions']
}

# NEW (Cadans):
anonymized = {
    'uuid': generate_uuid(),
    'client_type': client['industry'],  # "food_retail", "tech_startup"
    'transaction_count': client['invoice_count'],
    'avg_payment_days': client['avg_payment_time']
}
```

**Per-agent PII definitions:**

| Agent | PII Fields | Anonymous Fields |
|-------|-----------|------------------|
| PA | Email sender, subject, calendar attendees | Email category, meeting duration |
| Books | Client name, IBAN, invoice recipient | Client industry, invoice amount, payment term |
| Collect | Debtor name, email, IBAN | Overdue days, payment history score |
| Support | Customer name, email, phone | Ticket category, sentiment score |

---

## 2. Event Bus (Lifecycle Events)

### Location
- **Source:** `/root/NanoClaw/src/event-bus.ts`
- **Target:** `/root/cadans/framework/event-bus.ts`

### What It Does

**Typed event system** for NanoClaw lifecycle events (container spawned, output received, agent completed, etc.)

**Key Features:**
- Type-safe emit/on/once/off methods
- Error isolation (broken listener never crashes orchestrator)
- Comprehensive event types (12+ lifecycle events)

**Events:**
```typescript
- container:spawned
- container:output
- container:closed
- container:idle
- agent:invoked
- agent:completed
- session:cleared
- task:executed
- group:registered
- ipc:processed
- queue:retry
- queue:max-retries
```

---

### Why Cadans Needs This

**Cross-agent communication:**
- PA creates invoice → Notify Books agent
- Books creates invoice → Notify Collect agent (monitor payment)
- Collect detects payment → Notify PA (update client profile)

**Monitoring & alerting:**
- Agent errors → WhatsApp alert to owner
- Long-running tasks → Progress updates
- Failed integrations → Retry with backoff

**Audit trail:**
- Log all agent actions (GDPR requirement)
- Track billable actions (usage-based pricing)

---

### How to Transfer

**Step 1: Copy event-bus.ts**
```bash
cp /root/NanoClaw/src/event-bus.ts /root/cadans/framework/event-bus.ts
```

**Step 2: Add Cadans-specific events**
```typescript
// framework/event-bus.ts

export interface InvoiceCreatedEvent {
  timestamp: string;
  agentId: 'books';
  clientId: string;
  invoiceId: string;
  amount: number;
  dueDate: string;
}

export interface PaymentReceivedEvent {
  timestamp: string;
  agentId: 'collect';
  clientId: string;
  invoiceId: string;
  amount: number;
  paidDate: string;
}

export interface EmailDraftedEvent {
  timestamp: string;
  agentId: 'personal-assistant';
  clientId: string;
  emailId: string;
  category: 'urgent' | 'action' | 'fyi';
  requiresApproval: boolean;
}

export interface TicketResolvedEvent {
  timestamp: string;
  agentId: 'support';
  clientId: string;
  ticketId: string;
  autoResolved: boolean;
  resolutionTimeSeconds: number;
}

// Update EventMap
interface EventMap {
  // ... existing events
  'invoice:created': InvoiceCreatedEvent;
  'payment:received': PaymentReceivedEvent;
  'email:drafted': EmailDraftedEvent;
  'ticket:resolved': TicketResolvedEvent;
}
```

**Step 3: Usage in agents**
```typescript
import { EventBus } from './framework/event-bus.js';

const bus = new EventBus();

// Books agent creates invoice
bus.emit('invoice:created', {
  timestamp: new Date().toISOString(),
  agentId: 'books',
  clientId: 'client-123',
  invoiceId: 'INV-2026-042',
  amount: 1028.50,
  dueDate: '2026-04-05'
});

// Collect agent listens for new invoices
bus.on('invoice:created', (event) => {
  console.log(`New invoice: ${event.invoiceId}, monitoring payment...`);
  scheduleReminder(event.invoiceId, event.dueDate);
});
```

---

### Adaptation Requirements

**Minimal changes needed:**
- Add Cadans-specific event types (invoice, payment, email, ticket)
- Add billable action tracking (for usage-based pricing)

**Example: Billable action tracking**
```typescript
export interface BillableActionEvent {
  timestamp: string;
  clientId: string;
  agentId: string;
  action: 'email_sent' | 'invoice_created' | 'reminder_sent' | 'meeting_scheduled';
  costCredits: number; // e.g., 1 credit per action
}

bus.on('email:drafted', (event) => {
  if (event.requiresApproval === false) {
    // Auto-send = billable action
    bus.emit('billable:action', {
      timestamp: new Date().toISOString(),
      clientId: event.clientId,
      agentId: 'personal-assistant',
      action: 'email_sent',
      costCredits: 1
    });
  }
});
```

---

## 3. Design System Persistence (MASTER.md Pattern)

### Location
- **Source:** `/root/olorin/design-system/MASTER.md`
- **Target:** `/root/cadans/design-system/MASTER.md` ✅ ALREADY TRANSFERRED

### What It Does

**Persistent design decisions** saved to disk, retrieved automatically in future sessions.

**Hierarchical retrieval:**
- `MASTER.md` - Global design rules (colors, fonts, components)
- `pages/*.md` - Page-specific overrides

**Why it works:**
- Design survives across sessions (not in conversation memory)
- Brand consistency guaranteed (all pages use same colors/fonts)
- No regeneration needed (read from disk)

---

### Status in Cadans

✅ **ALREADY TRANSFERRED** - Created [/root/cadans/design-system/MASTER.md](/root/cadans/design-system/MASTER.md)

**Contains:**
- Cadans Indigo (#4F46E5), Signal Teal (#0D9488)
- Space Grotesk + Instrument Sans fonts
- Spacing scale (8/16/24/32/48/64px)
- Component specs (buttons, cards, forms)

**Usage:**
```bash
# Generate design system (already done)
cd /root/cadans/ui-ux-pro-max
python3 scripts/search.py "dutch smb saas professional" --design-system --persist -p "Cadans"

# Future pages automatically use MASTER.md
# No regeneration needed!
```

---

## 4. HITL (Human-in-the-Loop) System

### Location
- **Source:** `/root/olorin/compliance/hitl/hitl_system.py`
- **Target:** `/root/cadans/compliance/hitl/`

### What It Does

**Approval workflows** for sensitive AI actions.

**Modes:**
- **Auto:** AI acts without approval (low-risk actions)
- **HITL:** AI drafts, human approves before action (high-risk actions)
- **Manual:** Human does it entirely (critical actions)

**Example use cases:**
- Email drafting: HITL (user approves before sending)
- Invoice creation: HITL (user confirms amount/recipient)
- Payment matching: Auto (if IBAN + amount match)
- Legal notice: Manual (too risky for AI)

---

### Why Cadans Needs This

**Personal Assistant:**
- ❌ NEVER auto-send emails (HITL required)
- ✅ Auto-categorize emails (safe)
- ⚠️ Calendar booking: HITL for first 30 days, then auto if 100% approval rate

**Books:**
- ❌ NEVER auto-file VAT returns (human review required)
- ✅ Auto-match bank payments (if IBAN + amount match exactly)
- ⚠️ Expense categorization: HITL if OCR confidence <90%

**Collect:**
- ❌ NEVER send final notice without approval
- ✅ Auto-send friendly reminders (Day 15, 22)
- ⚠️ Payment plan negotiation: HITL for amounts >€5,000

---

### How to Transfer

**Step 1: Copy HITL system**
```bash
cp /root/olorin/compliance/hitl/hitl_system.py /root/cadans/compliance/hitl/
```

**Step 2: Define per-agent HITL rules**
```python
# compliance/hitl/agent_rules.py

AGENT_HITL_RULES = {
    'personal-assistant': {
        'email_send': 'hitl',          # ALWAYS require approval
        'email_categorize': 'auto',    # Safe, auto-categorize
        'calendar_book': 'hitl',       # Require approval (can become auto after trust period)
        'task_extract': 'auto'         # Safe
    },
    'books': {
        'invoice_create': 'hitl',      # Require approval
        'expense_categorize': 'hitl',  # Require approval if OCR confidence <90%
        'payment_match': 'auto',       # Auto if exact match
        'vat_return_file': 'manual'    # NEVER auto, human must file
    },
    'collect': {
        'reminder_send_stage1': 'auto',  # Friendly reminder, auto
        'reminder_send_stage2': 'auto',  # Still friendly, auto
        'reminder_send_stage3': 'hitl',  # Formal notice, require approval
        'final_notice': 'manual',        # NEVER auto
        'payment_plan': 'hitl'           # Require approval for plans >€5K
    },
    'support': {
        'faq_respond': 'auto',         # Auto if confidence >75%
        'ticket_escalate': 'auto',     # Auto escalate to human
        'refund_process': 'manual'     # NEVER auto-refund
    }
}
```

**Step 3: Usage in agents**
```python
from compliance.hitl import HITLSystem, HITLMode

hitl = HITLSystem()

# Personal Assistant: Email sending
action = 'email_send'
mode = hitl.get_mode('personal-assistant', action)

if mode == HITLMode.AUTO:
    send_email(draft)
elif mode == HITLMode.HITL:
    approval = request_approval_via_whatsapp(draft)
    if approval == 'yes':
        send_email(draft)
    else:
        log_rejection(draft)
elif mode == HITLMode.MANUAL:
    notify_user("Please send this email manually")
```

---

### Adaptation Requirements

**Trust escalation:**
- After 100 HITL approvals (100% approval rate) → Upgrade to auto
- After 1 rejection → Downgrade to HITL for 30 days

**Example:**
```python
# Personal Assistant: Calendar booking
# Initial: HITL mode
# After 100 approvals with 0 rejections → Auto mode
# If user rejects once → Back to HITL for 30 days

class TrustEscalation:
    def check_upgrade(self, agent_id, action):
        approvals = get_approval_count(agent_id, action)
        rejections = get_rejection_count(agent_id, action)

        if approvals >= 100 and rejections == 0:
            upgrade_to_auto(agent_id, action)
            notify_user(f"{action} upgraded to auto mode (100 approvals, 0 rejections)")

    def check_downgrade(self, agent_id, action):
        recent_rejection = get_last_rejection(agent_id, action)

        if recent_rejection and recent_rejection.days_ago < 30:
            downgrade_to_hitl(agent_id, action)
            notify_user(f"{action} downgraded to HITL mode (recent rejection)")
```

---

## 5. DPIA Generator (Data Protection Impact Assessment)

### Location
- **Source:** `/root/olorin/compliance/dpia/dpia_generator.py`
- **Target:** `/root/cadans/compliance/dpia/`

### What It Does

**Automated DPIA generation** for GDPR Article 35 compliance.

**When required:**
- Large-scale systematic monitoring
- Special category data processing
- Automated decision-making with legal effects

**Cadans triggers:**
- Custom agents processing >1,000 records/month
- Support agent with voice recording (special category data)
- Collect agent with credit scoring (automated decision-making)

---

### Why Cadans Needs This

**Custom agents:**
- Real estate agent: Large-scale property viewing scheduling (>1,000 candidates/month)
- Recruitment agent: CV screening with automated rejection (legal effect)
- Medical practice agent: Health data processing (special category)

**Standard agents (if large-scale):**
- Support agent: >10,000 tickets/month (systematic monitoring)
- Books agent: Automated expense categorization with tax deduction decisions

---

### How to Transfer

**Step 1: Copy DPIA generator**
```bash
cp /root/olorin/compliance/dpia/dpia_generator.py /root/cadans/compliance/dpia/
```

**Step 2: Create Cadans-specific template**
```python
# compliance/dpia/cadans_template.py

CADANS_DPIA_TEMPLATE = {
    'processing_description': 'AI-powered {agent_type} agent for {client_name}',
    'data_categories': {
        'personal-assistant': ['email content', 'calendar events', 'contact details'],
        'books': ['invoices', 'receipts', 'bank IBANs', 'tax records'],
        'collect': ['debtor contact info', 'payment history', 'financial distress indicators'],
        'support': ['customer conversations', 'order details', 'sentiment scores'],
        'custom': '{custom_data_categories}'  # Filled per client
    },
    'legal_basis': 'Contract (Art. 6(1)(b)) + Legitimate Interest (Art. 6(1)(f))',
    'retention_period': '7 years (Dutch tax law)',
    'security_measures': [
        'Dual-layer encryption (SQLCipher + Fernet)',
        'GDPR anonymization layer (ZERO PII to Claude)',
        'Access controls (per-client LUKS volumes)',
        'Audit logging (immutable, append-only)',
        'Regular backups (daily, 7-year retention)'
    ]
}
```

**Step 3: Generate DPIA per custom agent**
```bash
python3 compliance/dpia/dpia_generator.py \
  --agent-type "real-estate" \
  --client-name "ABC Makelaardij" \
  --data-volume "5000_viewings_per_month" \
  --output "compliance/dpia/abc-makelaardij-dpia.pdf"
```

---

## 6. Inference Filter (AI Output Validation)

### Location
- **Source:** `/root/olorin/compliance/filters/inference_filter.py`
- **Target:** `/root/cadans/compliance/filters/` (ADAPT)

### What It Does

**Validates AI output** before showing to users.

**Olórin checks:**
- No PII leakage (names, emails, phone numbers)
- No discriminatory language (gender, age, ethnicity bias)
- No recruitment-specific violations (asking illegal questions)

---

### Why Cadans Needs This (ADAPTED)

**Personal Assistant:**
- Email drafts: No offensive language, no PII from other clients
- Calendar invites: No double-bookings, no conflicts

**Books:**
- Invoice amounts: Validate against reasonable ranges (€10-€100K)
- VAT rates: Must be 0%, 9%, or 21% (no other values)

**Collect:**
- Reminder tone: Never aggressive before Day 30
- Legal threats: Only allowed in final notice (Day 46+)

---

### How to Transfer (ADAPT)

**Step 1: Copy inference filter**
```bash
cp /root/olorin/compliance/filters/inference_filter.py /root/cadans/compliance/filters/
```

**Step 2: Replace recruitment rules with agent rules**
```python
# compliance/filters/cadans_filters.py

def validate_email_draft(draft):
    """Validate PA email draft before sending."""
    errors = []

    # Check for offensive language
    offensive_patterns = ['fuck', 'shit', 'damn', 'idiot']
    if any(word in draft.lower() for word in offensive_patterns):
        errors.append("Offensive language detected")

    # Check for PII leakage (emails from other clients)
    # ... (check against known client emails)

    # Check for tone appropriateness
    if is_formal_sender(draft['to']) and uses_informal_language(draft['body']):
        errors.append("Tone mismatch: formal sender, informal language")

    return {'valid': len(errors) == 0, 'errors': errors}

def validate_invoice_amount(amount):
    """Validate Books invoice amount."""
    errors = []

    if amount < 10:
        errors.append("Amount too low (<€10)")
    if amount > 100000:
        errors.append("Amount too high (>€100K) - manual review required")

    return {'valid': len(errors) == 0, 'errors': errors}

def validate_reminder_tone(stage, message):
    """Validate Collect reminder tone."""
    errors = []

    aggressive_patterns = ['betaal nu', 'direct', 'onmiddellijk', 'laatste kans']

    if stage in [1, 2] and any(word in message.lower() for word in aggressive_patterns):
        errors.append("Aggressive tone detected in early reminder stage")

    return {'valid': len(errors) == 0, 'errors': errors}
```

---

## 7. LIA Generator (Legitimate Interest Assessment)

### Location
- **Source:** `/root/olorin/compliance/lia/lia_generator.py`
- **Target:** `/root/cadans/compliance/lia/` (ADAPT FOR MARKETING)

### What It Does

**Legitimate Interest Assessment** for GDPR Article 6(1)(f).

**Used when:**
- No explicit consent
- Not required by contract
- But processing is necessary for legitimate business interests

**Olórin use case:** Candidate sourcing (outbound recruitment)

---

### Why Cadans Needs This (ADAPTED)

**Marketing use cases:**
- Cold outreach (LinkedIn, email campaigns)
- Retargeting (website visitors who didn't convert)
- Client referrals (existing client recommends Cadans)

**NOT for agent operations** (those use Contract or Consent as legal basis)

---

### How to Transfer (ADAPT FOR MARKETING)

**Step 1: Copy LIA generator**
```bash
cp /root/olorin/compliance/lia/lia_generator.py /root/cadans/compliance/lia/
```

**Step 2: Adapt for Cadans marketing**
```python
# compliance/lia/cadans_lia.py

CADANS_LIA_TEMPLATE = {
    'purpose': 'Marketing outreach for AI agent services',
    'legitimate_interest': 'Business development and client acquisition',
    'necessity_test': {
        'is_necessary': True,
        'reasoning': 'Cold outreach is essential for B2B SaaS growth in Dutch SMB market'
    },
    'balancing_test': {
        'our_interests': ['Business growth', 'Market presence', 'Revenue generation'],
        'data_subject_interests': ['Privacy', 'Inbox management', 'No spam'],
        'mitigation': [
            'LinkedIn-only (professional context)',
            'One-touch rule (no follow-up if no response)',
            'Easy opt-out (unsubscribe link + do-not-contact flag)',
            'Relevant targeting (only SMB owners in NL, 10-200 employees)'
        ]
    },
    'conclusion': 'Legitimate interest applies (minimal intrusion + easy opt-out)'
}
```

---

## Transfer Priority (Recommended Order)

### Immediate (Week 1)

**1. GDPR Anonymization Layer** ✅ HIGHEST PRIORITY
- All agents handle sensitive data
- GDPR compliance is legally mandatory
- Foundation for all other components

**2. Event Bus** ✅ HIGH PRIORITY
- Cross-agent communication (PA → Books → Collect)
- Audit trail (billable actions)
- Monitoring & alerting

---

### Short-term (Week 2-3)

**3. HITL System** ⚠️ MEDIUM-HIGH PRIORITY
- Personal Assistant NEVER auto-sends emails (legal/reputation risk)
- Books NEVER auto-files VAT (compliance risk)
- Collect NEVER auto-sends final notice (legal risk)

**4. Inference Filter** ⚠️ MEDIUM PRIORITY
- Email draft validation (no offensive language, tone matching)
- Invoice amount validation (reasonable ranges)
- Reminder tone validation (no aggression before Day 30)

---

### Long-term (Month 2+)

**5. DPIA Generator** ⚠️ LOW PRIORITY (only for custom agents >1K records/month)
- Most standard agents won't trigger DPIA requirement
- Only needed for large-scale custom agents

**6. LIA Generator** ⚠️ LOW PRIORITY (marketing only)
- Not needed for agent operations (use Contract/Consent)
- Only for cold outreach campaigns

---

## File Transfer Checklist

```bash
# Create compliance directory structure
mkdir -p /root/cadans/compliance/{gdpr,hitl,dpia,filters,lia}
mkdir -p /root/cadans/framework

# Transfer GDPR (highest priority)
cp -r /root/NanoClaw/gdpr/* /root/cadans/compliance/gdpr/
cd /root/cadans && pip install -r compliance/gdpr/requirements.txt

# Transfer Event Bus
cp /root/NanoClaw/src/event-bus.ts /root/cadans/framework/event-bus.ts

# Transfer HITL
cp /root/olorin/compliance/hitl/hitl_system.py /root/cadans/compliance/hitl/

# Transfer DPIA (adapt)
cp /root/olorin/compliance/dpia/dpia_generator.py /root/cadans/compliance/dpia/

# Transfer Inference Filter (adapt)
cp /root/olorin/compliance/filters/inference_filter.py /root/cadans/compliance/filters/

# Transfer LIA (adapt for marketing)
cp /root/olorin/compliance/lia/lia_generator.py /root/cadans/compliance/lia/
```

---

## Configuration Changes Needed

### Environment Variables

**Update from NanoClaw/Olórin to Cadans:**

```bash
# OLD (NanoClaw/Olórin)
export OPENCLAW_DB_PATH="/var/lib/openclaw/mapping.db"
export OPENCLAW_RETENTION_DAYS="180"

# NEW (Cadans)
export CADANS_DB_PATH="/var/lib/cadans/client-data.db"
export CADANS_RETENTION_DAYS="2555"  # 7 years (Dutch tax law)
```

---

### Retention Period

**Critical change:**
- NanoClaw/Olórin: 180 days (recruitment industry)
- Cadans: 2555 days (7 years, Dutch tax law for financial data)

**Why:** Books agent handles invoices, receipts, VAT returns → 7-year retention MANDATORY

---

## Next Steps

**Immediate actions:**

1. **Transfer GDPR module** (today)
   ```bash
   cp -r /root/NanoClaw/gdpr /root/cadans/compliance/gdpr
   pip install -r compliance/gdpr/requirements.txt
   ```

2. **Generate encryption keys** (today)
   ```bash
   python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```

3. **Test GDPR integration** (tomorrow)
   ```bash
   cd /root/cadans
   python3 compliance/gdpr/examples/basic_usage.py
   ```

4. **Transfer Event Bus** (next week)
   ```bash
   cp /root/NanoClaw/src/event-bus.ts /root/cadans/framework/event-bus.ts
   ```

5. **Create HITL agent rules** (next week)
   - Define per-agent HITL modes (auto/hitl/manual)
   - Implement trust escalation (100 approvals → auto mode)

---

## Summary Table

| Component | Priority | Effort | Value | Status |
|-----------|----------|--------|-------|--------|
| GDPR Anonymization | ✅ Highest | High (2 days) | Critical | Ready to transfer |
| Event Bus | ✅ High | Low (2 hours) | High | Ready to transfer |
| Design System | ✅ N/A | N/A | High | ✅ Already done |
| HITL System | ⚠️ Medium-High | Medium (1 day) | High | Needs adaptation |
| Inference Filter | ⚠️ Medium | Medium (1 day) | Medium | Needs adaptation |
| DPIA Generator | ⚠️ Low | Low (4 hours) | Low | Only for custom agents |
| LIA Generator | ⚠️ Low | Low (4 hours) | Low | Only for marketing |

---

**Total transfer effort:** ~5 days (GDPR + Event Bus + HITL + Filters)

**Immediate ROI:** GDPR compliance (legally mandatory), cross-agent communication (PA ↔ Books ↔ Collect)

**Long-term ROI:** HITL trust escalation (reduce manual approvals after 100 successes), audit trail for billing
