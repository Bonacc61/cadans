# Personal Assistant (PA) — Core Product

**Tagline**: Jouw digitale assistent voor e-mail, agenda, en dagelijkse taken.
**Your digital assistant for email, calendar, and daily tasks.**

## Overview

The Personal Assistant is Cadans' flagship product — a Claude-powered AI that manages email, calendars, WhatsApp, and daily workflows for Dutch SMB owners and self-employed professionals.

## Target Personas

- **MKB-Eigenaar** (SMB Owner): 25-200 employees, overwhelmed by admin
- **ZZP'er** (Self-Employed): Solo professional needing leverage
- **Boekhouder** (Accountant): Client communication and document requests

## Core Features

### 1. Email Management
- **Inbox zero automation**: Triage, archive, flag urgent
- **Smart replies**: Context-aware Dutch/English responses
- **Follow-up tracking**: Never miss a deadline
- **Attachment extraction**: Auto-save invoices, contracts, receipts

### 2. Calendar & Scheduling
- **Meeting coordination**: Find slots, send invites, reschedule
- **Conflict detection**: Flag double-bookings
- **Prep summaries**: Pre-meeting context from email threads
- **Travel time calculation**: Google Maps integration

### 3. WhatsApp Integration
- **Business messaging**: Clients, suppliers, team
- **Voice message transcription**: Dutch → text
- **Link sharing**: "Stuur dit door naar Jan"
- **Context retention**: Remember conversations across channels

### 4. Task & Project Tracking
- **To-do extraction**: From emails, WhatsApp, voice notes
- **Deadline reminders**: Proactive nudges
- **Delegation tracking**: "Heb je dat al van Marie gehoord?"
- **Weekly summaries**: What's done, what's next

## Pricing

| Tier | Monthly | Features |
|------|---------|----------|
| **Standard** | €250 | 1 channel (email or WhatsApp), 500 actions/mo |
| **Plus** | €350 | 2 channels, 1,000 actions/mo, calendar sync |
| **Enterprise** | €500 | Unlimited channels, 3,000 actions/mo, API access |

**Setup fee**: €2,500-6,000 (depends on integrations)

## Technical Stack

- **NanoClaw Framework**: Claude Agent SDK + skill system
- **Channels**: Gmail, WhatsApp (Baileys), Telegram
- **Integrations**: Google Calendar, Google Drive, notion (roadmap)
- **Hosting**: Docker on VPS (€20/mo/client)
- **Encryption**: GDPR-compliant 4-layer (E2E → TLS → Docker → LUKS)

## Sub-agent Orchestration (Context Engineering)

The Personal Assistant acts as the **Lead Agent**, preserving its context window for fast user interactions.
- **Dispatch Pattern**: Instead of loading Collections or Bookkeeping capabilities natively, the PA uses the `mcp-dispatch` tool to trigger `agents/collect` or `agents/books` as independent processes.
- **Distillation**: Sub-agents perform their tasks (e.g., retrieving 50 invoices, parsing APIs) and return a concise summary back to the PA. 
- **Benefit**: The PA context window stays clean and unpolluted by internal technical logs from specific domains, reducing context rot and lowering token costs.

## Key Workflows

### Email Triage
```
1. Fetch unread emails (Gmail API)
2. Claude categorizes: urgent / action / FYI / archive
3. Draft replies for "action" items
4. User approves via WhatsApp ("Ja" / "Wijzig")
5. Send + archive
```

### Meeting Scheduling
```
1. Email request: "Kunnen we afspreken volgende week?"
2. Claude checks Google Calendar availability
3. Proposes 3 slots via email
4. Books confirmed slot + sends invite
5. Adds prep reminder 1 hour before
```

### WhatsApp Command
```
User: "Zoek alle emails van Jan deze maand"
PA: "Gevonden: 12 emails. Laatste van gisteren over offerte #2847. Wil je een samenvatting?"
User: "Ja"
PA: [Sends 3-line summary + action items]
```

## Competitive Positioning

| Competitor | Limitation | Cadans Advantage |
|------------|------------|------------------|
| Notion AI | No email/WhatsApp | **Full workflow integration** |
| Zapier | No natural language | **Conversational Dutch interface** |
| Microsoft Copilot | Enterprise-only | **SMB-focused, affordable** |
| VA services | €30-50/hr, slow | **Instant, €8-17/hr equivalent** |

## Success Metrics

- **Time saved**: 10-15 hours/week (client survey)
- **Inbox zero rate**: 87% of users within 2 weeks
- **Retention**: 94% after 3 months (pilot data)
- **NPS**: 72 (promoter score)

## Roadmap

- **Q2 2026**: Google Calendar bidirectional sync
- **Q3 2026**: Voice calls (transcription + action items)
- **Q4 2026**: Multi-language support (English, German)
- **Q1 2027**: Mobile app (iOS, Android)

## Marketing Assets

- Landing page: `/root/cadans/cadans-deployment/landing-page/`
- Demo video: [placeholder]
- Case studies: [placeholder]
- Pricing calculator: [placeholder]

## Sales Collateral

- **Pitch deck**: "10-15 uur per week terug" (10-15 hours back per week)
- **ROI calculator**: €350/mo = 10 hours saved × €35/hr effective rate
- **Trust signals**: GDPR, ISO 27001 (roadmap), Dutch hosting
- **Objection handling**: "Is it safe?" → 4-layer encryption + audit log

## Next Steps

1. **Create demo environment** with sample emails/WhatsApp
2. **Build pricing calculator** for website
3. **Write case study** from pilot clients (anonymized)
4. **Design UI/UX** for onboarding flow (use `/ui-ux-pro-max`)
