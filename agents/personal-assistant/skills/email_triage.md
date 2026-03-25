# Email Triage Skill

## Purpose

Automatically categorize, draft replies, and manage inbox to achieve inbox zero.

---

## Email Categorization

### Categories

1. **Urgent** — Requires immediate action (within 24h)
2. **Action** — Requires response/task (within 3 days)
3. **FYI** — Informational, no action needed
4. **Archive** — Newsletters, receipts, confirmations
5. **Spam** — Unwanted, promotional

---

## Triage Workflow

**Runs every 15 minutes:**

1. **Fetch unread emails** via Gmail/Outlook API
2. **For each email:**
   - Extract sender, subject, body
   - Detect language (NL/EN)
   - Classify into category (Urgent/Action/FYI/Archive/Spam)
   - Generate draft reply (for Urgent/Action)
   - Add labels/flags
3. **Send daily summary** via WhatsApp

---

## Classification Rules

### Urgent (High Priority)

**Indicators:**
- Keywords: "dringend", "urgent", "asap", "vandaag", "deadline", "probleem"
- From: Boss, key client, accountant
- Subject contains: "RE: [important project]"
- Attachment type: Contract, invoice

**Action:**
- Label: ⚠️ URGENT
- Alert user immediately via WhatsApp
- Draft reply within 30 minutes

---

### Action Required

**Indicators:**
- Contains question ("?")
- Requests meeting ("kunnen we afspreken", "when can we meet")
- Asks for document ("kun je sturen", "can you send")
- Follow-up needed ("laat me weten", "let me know")

**Action:**
- Label: 📋 ACTION
- Draft reply
- Extract task (if applicable)
- Add to follow-up list

---

### FYI (Informational)

**Indicators:**
- CC'd (not in To: field)
- Newsletters with "Update", "News", "Digest"
- No questions or action items
- Auto-generated reports

**Action:**
- Label: ℹ️ FYI
- Archive (keep unread if important sender)
- No reply needed

---

### Archive (Auto-archive)

**Indicators:**
- Order confirmations ("Bedankt voor je bestelling")
- Receipt emails ("Factuur bijgevoegd")
- Newsletter unsubscribe confirmations
- Out-of-office replies
- Calendar invites (already processed)

**Action:**
- Mark as read
- Archive immediately
- Extract attachment if invoice/receipt (save to Drive)

---

### Spam

**Indicators:**
- From unknown sender + promotional keywords
- Subject: "Free", "Click here", "Limited time"
- Unsubscribe link + no prior interaction
- Generic greetings ("Dear customer")

**Action:**
- Mark as spam
- Unsubscribe if one-click available
- Block sender (if repeated)

---

## Reply Drafting

### For Urgent/Action Emails

**Process:**
1. Analyze email content
2. Determine intent (question, request, scheduling, etc.)
3. Generate contextual reply
4. Save as draft (Gmail/Outlook)
5. Send to user for approval via WhatsApp

**Example:**

**Incoming email:**
```
From: jan@bakkerij.nl
Subject: Offerte website

Hoi,

Kunnen jullie een offerte sturen voor een nieuwe webshop?
Graag deze week nog.

Groet,
Jan
```

**PA generates draft:**
```
Beste Jan,

Bedankt voor je interesse!

Ik stuur je vandaag nog een offerte voor de webshop.
Heb je voorkeur voor specifieke functionaliteit? (bijv. betaalmethoden, voorraadkoppeling)

Ik bel je morgen om door te spreken.

Met vriendelijke groet,
[YOUR_NAME]
```

**WhatsApp notification:**
```
📧 Nieuw email van Jan (Bakkerij de Vries)

Onderwerp: Offerte website
Vraag: Offerte webshop, deze week

💬 Concept antwoord:
"Bedankt voor je interesse! Ik stuur je vandaag nog een offerte..."

Opties:
1. Verstuur zoals het is
2. Wijzig concept
3. Ik doe het zelf
```

**User approval:**
```
User: "1"
PA: "Email verzonden naar jan@bakkerij.nl ✓
     Taak toegevoegd: Offerte webshop voor Jan (deadline: vandaag)"
```

---

## Smart Reply Templates

### Meeting Request

**Incoming:** "Kunnen we deze week afspreken?"

**Draft:**
```
Beste [NAAM],

Deze week heb ik de volgende tijden beschikbaar:

- Woensdag 26 maart: 10:00, 14:30, 16:00
- Donderdag 27 maart: 09:00, 15:00
- Vrijdag 28 maart: 11:00, 13:30

Welke tijd past het beste? Dan stuur ik je een agenda-uitnodiging.

Met vriendelijke groet,
[YOUR_NAME]
```

---

### Document Request

**Incoming:** "Kun je de factuur van vorige maand sturen?"

**Draft:**
```
Beste [NAAM],

Bijgevoegd de factuur van [MONTH] (factuur #[NUMBER]).

Laat me weten als je nog vragen hebt!

Met vriendelijke groet,
[YOUR_NAME]
```

**PA actions:**
- Search Drive for "factuur + [MONTH]"
- Attach PDF to draft
- If not found, alert user

---

### Follow-up

**Incoming:** "Ik kom hier volgende week op terug"

**Draft:**
```
Beste [NAAM],

Prima, ik hoor graag van je!

Als ik volgende week woensdag nog niets heb gehoord, stuur ik je een reminder.

Met vriendelijke groet,
[YOUR_NAME]
```

**PA actions:**
- Schedule follow-up reminder (7 days)
- If no reply received, send gentle nudge

---

## Context Retention

**PA remembers:**
- Previous email threads (quotes context in reply)
- Client details (company, role, past interactions)
- Ongoing projects (references in replies)
- Preferences (preferred meeting times, communication style)

**Example:**

**Thread context:**
```
Email 1 (2 weeks ago): "We gaan samenwerken aan de webshop!"
Email 2 (1 week ago): "Ik stuur je het logo volgende week"
Email 3 (today): "Heb je het logo al ontvangen?"
```

**PA draft:**
```
Beste Jan,

Nog niet binnen. Kun je het logo nogmaals sturen? Dan verwerk ik het direct.

(Ref: Je zou het vorige week sturen, mogelijk onderweg kwijtgeraakt)

Met vriendelijke groet,
[YOUR_NAME]
```

---

## Attachment Handling

**Auto-save to Google Drive:**

**Invoices → `/Drive/Administratie/Inkomende Facturen/2026/`**
**Contracts → `/Drive/Contracten/`**
**Receipts → `/Drive/Administratie/Bonnetjes/2026/Q1/`**

**Naming convention:**
`{DATE}_{SENDER}_{DESCRIPTION}.pdf`

Example: `2026-03-21_Hetzner_VPS-Invoice.pdf`

---

## Daily Summary

**Sent via WhatsApp at 8:00 AM:**

```
📬 Email Samenvatting (21 maart)

⚠️ Urgent (2):
- Jan de Bakker: Offerte webshop (deadline: vandaag)
- Belastingdienst: BTW-aangifte herinnering (deadline: 30 april)

📋 Action (5):
- Marie (HR): Vraag over contract
- Piet's Garage: Factuur #847 (betaling verwacht)
- LinkedIn: 3 nieuwe berichten
- ... (2 meer)

ℹ️ FYI (8):
- Nieuwsbrief A, B, C
- Google Drive: 2 bestanden gedeeld
- ... (4 meer)

📦 Archived (12):
- Order confirmations, receipts

────────────
Totaal: 27 emails → 15 actief, 12 gearchiveerd

Wil je de urgente emails nu zien?
```

---

## Follow-up Tracking

**PA tracks:**
- Emails awaiting reply (>3 days old)
- Promised actions ("Ik stuur je dit morgen")
- Scheduled reminders ("Laat me volgende week weten")

**Weekly reminder:**
```
🔔 Follow-up Reminder

Deze emails wachten nog op antwoord:

1. Marie (HR) - 5 dagen geleden: Vraag over contract
2. Piet's Garage - 8 dagen geleden: Factuur betaling

Wil je dat ik een reminder stuur?
```

**User:** "1"

**PA sends:**
```
To: marie@company.nl
Subject: RE: Contract vraag

Hoi Marie,

Ik zie dat ik nog niet heb gereageerd op je vraag over het contract.
Sorry voor het ongemak!

Kun je me een reminder geven wat je specifiek wilt weten?

Met vriendelijke groet,
[YOUR_NAME]
```

---

## Unsubscribe Management

**Auto-detect newsletters:**

If email contains:
- "Unsubscribe" link
- Frequency: Weekly/Daily digest
- From known marketing domain

**PA suggests:**
```
📧 Nieuwsbrief van [SENDER]

Je hebt 8 emails van hen deze maand, 0 geopend.

Wil je uitschrijven?

1. Ja, uitschrijven
2. Nee, behouden
3. Archiveer automatisch (geen notificaties)
```

**User:** "1"

**PA:** "Uitgeschreven van [SENDER] ✓"

---

## Integration with Calendar

**When email mentions meeting:**

**PA detects:** "Kunnen we volgende week dinsdag om 14:00 afspreken?"

**PA actions:**
1. Check Google Calendar for availability (Tuesday 14:00)
2. If available → Draft acceptance + create tentative event
3. If conflict → Propose alternative times

**Draft:**
```
Beste [NAAM],

Dinsdag 14:00 past prima!

Ik heb een agenda-uitnodiging gestuurd.
Locatie: [DEFAULT_LOCATION] (of online via Meet?)

Tot dan!

Met vriendelijke groet,
[YOUR_NAME]
```

**Calendar event:**
```
Title: Meeting met [NAAM]
Date: Tuesday, March 25, 2026
Time: 14:00 - 15:00
Location: [TBD - pending confirmation]
```

---

## GDPR Compliance

### Email Data Retention

- **Active threads:** Kept indefinitely (until user archives)
- **Archived threads:** 2 years
- **Deleted emails:** Permanent delete (no recovery)

### Email Access Scopes

**Requested permissions:**
- Read emails (gmail.readonly)
- Send emails (gmail.send)
- Modify labels (gmail.modify)
- **NOT** requested: gmail.compose (too broad)

### User Control

User can:
- Pause email monitoring ("Stop checking email voor 1 week")
- Exclude senders ("Nooit auto-reply naar [EMAIL]")
- Export all email data ("Download mijn email geschiedenis")

---

## Anti-Patterns

- ❌ Never send emails without user approval (always draft first)
- ❌ Never auto-archive emails from VIP senders
- ❌ Never reply to no-reply@* addresses
- ❌ Never include sensitive data in WhatsApp summaries (mask amounts >€1000)
- ❌ Never promise delivery dates without checking calendar/capacity
- ❌ Never use informal tone for formal senders (detect from previous emails)
