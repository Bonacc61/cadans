# Personal Assistant Agent - Development Guide

**Agent Type:** Multi-Channel Orchestration (Email + Calendar + WhatsApp + Tasks)
**Complexity:** High (cross-platform integration, context retention, approval workflows)
**Last Updated:** 2026-03-22

---

## Purpose

The PA is the flagship product. It orchestrates email triage, calendar scheduling, task extraction, and cross-channel communication. **NEVER auto-send emails** (always draft first, get approval).

---

## Core Principle: Human-in-the-Loop (MANDATORY)

**NEVER send emails without user approval.**

**Process:**
1. Email arrives → PA analyzes → Drafts reply
2. Send draft to user via WhatsApp for approval
3. User approves ("1"), edits ("2"), or rejects ("3")
4. ONLY then send email

**Why:** Mistakes in email are costly. Automation increases productivity, not risk.

---

## Email Triage (Gmail/Outlook)

### 5 Categories (STRICT)

**1. Urgent** (⚠️)
- Keywords: "dringend", "urgent", "asap", "vandaag", "deadline"
- From: Boss, key client, accountant, lawyer
- Action: Draft reply immediately + alert user via WhatsApp

**2. Action** (📋)
- Contains: Questions ("?"), meeting requests, document requests
- Action: Draft reply + extract task + add to follow-up list

**3. FYI** (ℹ️)
- CC'd emails, newsletters, auto-generated reports
- Action: Archive (keep unread if important sender)

**4. Archive** (📦)
- Order confirmations, receipts, out-of-office, calendar invites
- Action: Mark read + archive + extract attachments (invoices, receipts)

**5. Spam** (🚫)
- Unknown sender + promotional keywords
- Action: Mark spam + unsubscribe (one-click if available)

**Classification accuracy target:** >90%

---

## Reply Drafting

### Context Retention (CRITICAL)

**ALWAYS quote previous context:**

```javascript
const draftReply = (email, conversationHistory) => {
  const context = conversationHistory.slice(-3); // Last 3 emails

  return `
Beste ${email.from.name},

[REFERENCE PREVIOUS CONVERSATION]
${summarizeContext(context)}

[ANSWER CURRENT QUESTION]
${generateAnswer(email.body)}

Met vriendelijke groet,
${user.name}
  `.trim();
};
```

**Example:**

**Thread:**
- Email 1 (2 weeks ago): "We gaan samenwerken aan de webshop!"
- Email 2 (1 week ago): "Ik stuur je het logo volgende week"
- Email 3 (today): "Heb je het logo al ontvangen?"

**PA draft:**
```
Beste Jan,

Nog niet binnen. Kun je het logo nogmaals sturen? Dan verwerk ik het direct.

(Ref: Je zou het vorige week sturen, mogelijk onderweg kwijtgeraakt)

Met vriendelijke groet,
[YOUR_NAME]
```

---

### Tone Matching

**Detect sender's tone from previous emails:**

**Formal sender (always "u"):**
```
Geachte heer/mevrouw [LAST_NAME],

[FORMAL CONTENT]

Hoogachtend,
[YOUR_NAME]
```

**Informal sender (always "je"):**
```
Hoi [FIRST_NAME],

[INFORMAL CONTENT]

Groet,
[YOUR_NAME]
```

**NEVER mix tones** (if sender uses "u", PA uses "u")

---

## Calendar Management (Google Calendar / Microsoft 365)

### Availability Check

**Process:**
1. Email mentions meeting → Extract proposed date/time
2. Query calendar API for that slot
3. If available → Draft acceptance + create tentative event
4. If conflict → Propose 3 alternative times

**API call (Google Calendar):**
```javascript
const checkAvailability = async (date, startTime, endTime) => {
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: `${date}T${startTime}:00+01:00`,
      timeMax: `${date}T${endTime}:00+01:00`,
      items: [{ id: '{CALENDAR_ID}' }] // [PLACEHOLDER]
    }
  });

  const busy = response.data.calendars['{CALENDAR_ID}'].busy;
  return busy.length === 0; // True if available
};
```

---

### Conflict Detection (MANDATORY)

**NEVER double-book:**

```javascript
if (hasConflict(requestedTime, existingEvents)) {
  // Alert user + propose alternatives
  return {
    available: false,
    conflict: existingEvents[0].summary,
    alternatives: findNextAvailableSlots(3)
  };
}
```

**User notification:**
```
⚠️ CONFLICT

Donderdag 27 maart 10:00 is al bezet:
- Team standup (09:30 - 10:30)

Alternatieve tijden:
1. 11:00 - 12:00
2. 13:00 - 14:00
3. 15:00 - 16:00

Kies andere tijd:
```

---

### Buffer Time (MANDATORY)

**Default:** 15 minutes before/after each meeting

**Why:** Prevents back-to-back meetings, allows prep/travel time

**Implementation:**
```javascript
const addBufferTime = (event) => {
  return {
    start: subtractMinutes(event.start, 15),
    end: addMinutes(event.end, 15),
    summary: `[Buffer] ${event.summary}`,
    transparency: 'opaque' // Blocks calendar
  };
};
```

**User can configure:** 0, 15, 30, or 60 minutes

---

## Task Extraction

**Extract from emails:**

```javascript
const extractTasks = (emailBody) => {
  const patterns = [
    /kun je (.+?) (sturen|maken|checken)/i,  // "kun je factuur sturen"
    /graag (.+?) (voor|op) (.+?)/i,          // "graag offerte voor vrijdag"
    /ik moet (.+?) (doen|maken|sturen)/i     // "ik moet rapport maken"
  ];

  const tasks = [];
  for (const pattern of patterns) {
    const match = emailBody.match(pattern);
    if (match) {
      tasks.push({
        description: match[1],
        deadline: extractDate(match[3]),
        source: 'email'
      });
    }
  }
  return tasks;
};
```

**Add to user's todo list + remind before deadline**

---

## WhatsApp Integration

### Daily Summary (08:00 AM)

```
📬 Email Samenvatting (21 maart)

⚠️ Urgent (2):
- Jan de Bakker: Offerte webshop (deadline: vandaag)
- Belastingdienst: BTW-aangifte (deadline: 30 april)

📋 Action (5):
- Marie (HR): Contract vraag
- Piet's Garage: Factuur betaling
- LinkedIn: 3 nieuwe berichten
... (2 meer)

ℹ️ FYI (8):
- Nieuwsbrieven, updates

📦 Archived (12):
- Order confirmations, receipts

────────────
Totaal: 27 emails → 15 actief, 12 gearchiveerd

Wil je de urgente emails nu zien?
```

---

### Approval Workflow

**For drafted emails:**

```
📧 Nieuw email van Jan (Bakkerij de Vries)

Onderwerp: Offerte website
Vraag: Offerte webshop, deze week

💬 Concept antwoord:
"Bedankt voor je interesse! Ik stuur je vandaag nog een offerte voor de webshop. Heb je voorkeur voor specifieke functionaliteit?"

Opties:
1. Verstuur zoals het is
2. Wijzig concept
3. Ik doe het zelf
```

**User responds:** "1"

**PA:** "Email verzonden naar jan@bakkerij.nl ✓"

---

## Cross-Agent Integration

### With Books Agent

**Scenario:** Email requests invoice

```
Email: "Kun je factuur voor vorige maand sturen?"
PA: [Detects invoice request]
    [Hands off to Books agent]

Books: [Searches for invoice in Exact/Moneybird]
       [Finds invoice #INV-2026-038]
       [Attaches PDF to email draft]

PA: [Receives draft from Books]
    [Sends to user for approval via WhatsApp]
```

---

### With Collect Agent

**Scenario:** PA creates invoice → Collect monitors payment

```
PA: [Invoice created via Books agent]
Books: "Factuur #INV-042 aangemaakt (€1.028,50, vervaldatum 5 april)"
PA: "Wil je automatische herinneringen inschakelen?"
User: "Ja"
PA: [Notifies Collect agent]
Collect: [Monitors invoice status]
         [Sends reminder Day 15 if unpaid]
```

---

## GDPR Compliance

### Email Access Scopes (MINIMAL)

**Requested permissions:**
- `gmail.readonly` — Read emails
- `gmail.send` — Send emails (after approval)
- `gmail.modify` — Add labels, archive

**NOT requested:**
- `gmail.compose` — Too broad
- `gmail.settings` — Unnecessary

---

### Data Retention

**Email metadata:** 2 years (subject, sender, date, category)
**Email body:** 90 days (then delete, keep metadata only)
**Draft replies:** 30 days (then delete if not sent)
**Calendar events:** Indefinitely (until user deletes)

**User can export all data:**
```
User: "Download mijn email geschiedenis"
PA: [Generates ZIP file]
    [Includes: email metadata CSV, drafts, calendar events]
    [Sends download link]
```

---

## Configuration Placeholders

### Per-Client Settings

```json
{
  "client_id": "{CLIENT_SLUG}",
  "user_name": "{USER_FULL_NAME}",
  "user_email": "{USER_EMAIL}",
  "user_phone": "{USER_PHONE}",
  "integrations": {
    "email": {
      "provider": "{gmail|outlook}",
      "email_address": "{EMAIL_ADDRESS}",
      "oauth_refresh_token": "{ENCRYPTED}"
    },
    "calendar": {
      "provider": "{google|microsoft365}",
      "calendar_id": "{CALENDAR_ID}",
      "oauth_refresh_token": "{ENCRYPTED}"
    },
    "whatsapp": {
      "phone_number": "{WHATSAPP_NUMBER}",
      "session_id": "{ENCRYPTED}"
    }
  },
  "preferences": {
    "language": "nl", // [OPTIONS: nl, en]
    "tone": "professional", // [OPTIONS: professional, casual]
    "working_hours": {
      "start": "09:00",
      "end": "18:00"
    },
    "buffer_time_minutes": 15, // [CONFIGURABLE: 0, 15, 30, 60]
    "daily_summary_time": "08:00", // [CONFIGURABLE]
    "vip_senders": [ // [REPLACE WITH EMAIL ADDRESSES]
      "{VIP_EMAIL_1}",
      "{VIP_EMAIL_2}"
    ]
  },
  "gdpr": {
    "email_body_retention_days": 90,
    "metadata_retention_years": 2
  }
}
```

---

## Anti-Patterns (NEVER DO THIS)

### Email Mistakes (CRITICAL)
- ❌ **NEVER send emails without approval** (draft → approve → send)
- ❌ NEVER skip context retention (always quote previous emails)
- ❌ NEVER mix formal/informal tone
- ❌ NEVER reply to no-reply@* addresses
- ❌ NEVER promise delivery dates without checking calendar/capacity

### Calendar Errors
- ❌ NEVER double-book meetings
- ❌ NEVER schedule outside working hours (default 09:00-18:00)
- ❌ NEVER skip buffer time (causes burnout)
- ❌ NEVER auto-confirm meetings (always ask user first)

### Context Failures
- ❌ NEVER forget previous conversations (check thread history)
- ❌ NEVER lose tasks extracted from emails
- ❌ NEVER ignore VIP senders (always prioritize)

---

## Testing Checklist

Before deploying to production:

- [ ] Test email triage (10 test emails → verify categories)
- [ ] Test reply drafting (include context from thread)
- [ ] Test tone matching (formal sender → formal reply)
- [ ] Test calendar availability (check conflicts)
- [ ] Test buffer time (15 min before/after meetings)
- [ ] Test WhatsApp approval workflow (draft → approve → send)
- [ ] Test task extraction (email with "kun je factuur sturen")
- [ ] Test cross-agent handoff (PA → Books for invoice)
- [ ] Test VIP sender prioritization
- [ ] Test GDPR: Export all email data
- [ ] Test OAuth refresh (Gmail token expires after 7 days)
- [ ] Verify NO emails sent without approval

---

## Support & Maintenance

**Owner:** [DEVELOPER_NAME - PLACEHOLDER]
**Client contact:** [CLIENT_EMAIL - PLACEHOLDER]
**Support tier:** [Standard/Premium/Enterprise - PLACEHOLDER]

**Known issues:**
- Gmail API sometimes slow (>3s response) — timeout set to 5s
- Google Calendar OAuth tokens expire after 7 days — auto-refresh implemented

**Roadmap:**
- Q3 2026: Voice calls (transcription + action items)
- Q4 2026: Multi-language support (English, German)
- Q1 2027: Mobile app (iOS, Android)

---

## Changelog

**v1.0.0** (2026-03-22)
- Initial scaffolding
- Email triage (5 categories)
- Reply drafting (context retention + tone matching)
- Calendar management (conflict detection, buffer time)
- WhatsApp integration (daily summary, approval workflow)
- Cross-agent integration (PA ↔ Books ↔ Collect)
- GDPR compliance (90-day body retention, 2-year metadata)
