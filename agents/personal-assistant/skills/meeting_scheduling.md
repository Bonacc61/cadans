# Meeting Scheduling Skill

## Purpose

Coordinate meetings, check availability, send invites, and manage conflicts — all via conversational commands.

---

## Scheduling Workflow

### 1. Inbound Meeting Request (via Email)

**Email:**
```
From: jan@bakkerij.nl
Subject: Afspraak maken

Hoi,

Kunnen we volgende week een keer afspreken om de webshop door te nemen?
Liefst in de ochtend.

Groet,
Jan
```

**PA Process:**
1. **Detect scheduling intent** ("afspreken", "volgende week", "ochtend")
2. **Check Google Calendar** for next week, morning slots
3. **Propose 3 options**
4. **Draft email** with availability

**Draft Reply:**
```
Beste Jan,

Volgende week heb ik deze ochtenden beschikbaar:

- Maandag 24 maart: 09:00, 10:30
- Woensdag 26 maart: 09:00, 11:00
- Donderdag 27 maart: 10:00

Welke tijd past het beste? Dan stuur ik je een agenda-uitnodiging.

Voorkeur voor locatie/online?

Met vriendelijke groet,
[YOUR_NAME]
```

**User approves** → Email sent

**Jan replies:** "Woensdag 09:00 past prima"

**PA creates Google Calendar event:**
```
Title: Webshop doorloop - Jan (Bakkerij de Vries)
Date: Wednesday, March 26, 2026
Time: 09:00 - 10:00
Location: [DEFAULT_OFFICE] (confirmed via email)
Attendees: jan@bakkerij.nl, [YOUR_EMAIL]
Description: Webshop project kickoff
```

**PA confirms:**
```
To: jan@bakkerij.nl
Subject: RE: Afspraak maken

Perfect! Afspraak gemaakt voor woensdag 26 maart om 09:00.

Agenda-uitnodiging gestuurd.
Locatie: [ADDRESS]

Tot dan!

Met vriendelijke groet,
[YOUR_NAME]
```

---

### 2. Outbound Meeting Request (via WhatsApp)

**User:** "Plan meeting met Marie over Q2 planning, volgende week"

**PA:**
```
📅 Meeting plannen met Marie

Wanneer wil je afspreken?
1. Maandag 24 maart
2. Dinsdag 25 maart
3. Woensdag 26 maart
4. Donderdag 27 maart
5. Vrijdag 28 maart
```

**User:** "3"

**PA checks calendar for Wednesday:**
```
Woensdag 26 maart beschikbaar:

Ochtend:
- 10:00 - 11:00
- 11:30 - 12:30

Middag:
- 14:00 - 15:00
- 15:30 - 16:30

⚠️ Let op: Je hebt al een afspraak om 09:00 (Jan - Webshop)

Welke tijd?
```

**User:** "14:00"

**PA:**
```
✓ Meeting ingepland:

Titel: Q2 Planning met Marie
Datum: Woensdag 26 maart
Tijd: 14:00 - 15:00
Locatie: Kantoor / Online?
```

**User:** "Online"

**PA:**
```
Google Meet link aangemaakt:
meet.google.com/abc-defg-hij

Uitnodiging gestuurd naar marie@company.nl

Marie heeft GEACCEPTEERD ✓
```

---

## Conflict Detection

**User:** "Plan meeting met Piet donderdag 10:00"

**PA checks calendar:**
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

**User:** "1"

**PA:** "Meeting met Piet ingepland voor 11:00 ✓"

---

## Rescheduling

**User:** "Verzet meeting met Jan naar vrijdag"

**PA:**
```
Welke meeting bedoel je?

Deze week:
1. Jan (Webshop) - Woensdag 09:00
2. Marie (Q2 Planning) - Woensdag 14:00

Kies:
```

**User:** "1"

**PA checks Friday availability:**
```
Vrijdag 28 maart beschikbaar:

- 09:00 - 10:00 ✓
- 10:30 - 11:30 ✓
- 13:00 - 14:00 ✓
- 14:30 - 15:30 ✓

Welke tijd?
```

**User:** "09:00"

**PA:**
```
Meeting verzet naar vrijdag 28 maart 09:00.

Email naar Jan:
"Hoi Jan, kunnen we onze afspraak verzetten van woensdag naar vrijdag 09:00? Zelfde onderwerp (webshop doorloop). Laat me weten of dit past!"

Versturen?
```

**User:** "Ja"

**PA:** "Email verzonden. Wachten op bevestiging Jan..."

**Jan replies:** "Prima!"

**PA:** "Jan heeft bevestigd ✓ Agenda bijgewerkt."

---

## Travel Time Calculation

**Integration with Google Maps API**

**User:** "Plan meeting bij Jan op locatie"

**PA:**
```
Jan's locatie: Kerkstraat 12, Amsterdam

Reistijd vanaf [YOUR_OFFICE]:
- Auto: 28 minuten (via A10)
- OV: 42 minuten (Metro + tram)

Vertrek om 08:15 voor meeting om 09:00?

Agenda-item toevoegen:
📍 08:15 - Vertrek naar Jan (Kerkstraat 12)
📅 09:00 - Meeting met Jan

Bevestigen?
```

**User:** "Ja"

**PA:** "Agenda bijgewerkt met reistijd ✓"

---

## Pre-Meeting Preparation

**1 hour before meeting:**

```
🔔 Meeting over 1 uur

📅 09:00 - Webshop doorloop met Jan

📧 Email context:
- Jan vroeg offerte voor webshop
- Voorkeur voor specifieke functionaliteit: betaalmethoden, voorraad
- Locatie: Kerkstraat 12, Amsterdam

📎 Relevante bestanden:
- webshop-template-offerte.pdf (Drive)
- jan-bakkerij-notes.md (vorige meeting)

🚗 Vertrek om 08:15 (28 min rijden)

Wil je een samenvatting van eerdere emails met Jan?
```

---

## Recurring Meetings

**User:** "Plan wekelijkse standup, elke maandag 09:30"

**PA:**
```
Wekelijkse standup ingepland:

Frequentie: Elke maandag
Tijd: 09:30 - 10:00
Deelnemers: [TEAM_EMAILS]
Eerste: Maandag 24 maart 2026
Herhaling: Tot einde 2026 (of onbeperkt?)

Bevestigen?
```

**User:** "Tot einde Q2"

**PA:** "Standup ingepland tot 30 juni 2026 (14 meetings) ✓"

---

## Multi-Attendee Coordination

**User:** "Plan meeting met Jan, Marie, en Piet volgende week"

**PA:**
```
3 deelnemers, hun beschikbaarheid ophalen...

⚠️ Moeilijk om iedereen gelijktijdig te plannen.

Beste opties (allen beschikbaar):
1. Dinsdag 25 maart 15:00 - 16:00
2. Donderdag 27 maart 11:00 - 12:00

Kies:
```

**User:** "1"

**PA:**
```
Uitnodiging verstuurd naar:
- jan@bakkerij.nl
- marie@company.nl
- piet@garage.nl

Wachten op antwoorden...

Status:
✅ Marie: Geaccepteerd
⏳ Jan: Nog geen antwoord
⏳ Piet: Nog geen antwoord
```

**24 hours later:**

```
🔔 Meeting Update

Dinsdag 25 maart 15:00:

✅ Marie: Geaccepteerd
❌ Piet: Afgewezen (conflict)
⏳ Jan: Geen antwoord

Wil je Piet een alternatief voorstellen?
```

---

## Buffer Time Management

**User setting:** "Blokkeer 15 minuten voor/na meetings"

**PA:**
```
Buffer time ingesteld: 15 minuten voor/na elk meeting.

Dit voorkomt:
- Back-to-back meetings zonder pauze
- Reistijd overlap
- Voorbereiding stress

Voorbeeld:
10:00 - 11:00: Meeting A
11:00 - 11:15: Buffer (geblokkeerd)
11:30 - 12:30: Meeting B (vroegst mogelijke volgende slot)
```

---

## Calendar Sync Across Platforms

**If user has multiple calendars:**

```
Welke kalenders wil je synchroniseren?

1. Google Calendar (Werk)
2. Microsoft 365 (Freelance projecten)
3. Apple Calendar (Privé)

Selecteer (1,2,3 of meerdere):
```

**User:** "1,2"

**PA:**
```
Sync ingesteld:

Werk + Freelance → Gecombineerde beschikbaarheid
Privé → Verborgen (alleen geblokkeerde slots)

Bij het plannen van meetings houd ik rekening met al je kalenders.
```

---

## Out-of-Office

**User:** "Ik ben volgende week maandag t/m woensdag afwezig"

**PA:**
```
Out-of-office ingesteld:

Periode: 24-26 maart 2026 (3 dagen)

Acties:
1. Automatisch afwijzen van nieuwe meeting requests
2. Out-of-office reply instellen in Gmail
3. Bestaande meetings verzetten?

Wil je bestaande meetings (2 stuks) verzetten?
```

**User:** "Ja"

**PA:**
```
2 meetings gevonden:

1. Jan (Webshop) - Woensdag 09:00
2. Marie (Q2 Planning) - Woensdag 14:00

Verzetten naar:
- Jan: Vrijdag 28 maart 09:00?
- Marie: Donderdag 27 maart 14:00?

Bevestigen?
```

**User:** "Ja"

**PA:**
```
Emails verstuurd naar Jan en Marie.

Out-of-office reply ingesteld:
"Ik ben afwezig van 24-26 maart. Ik reageer op uw email na 27 maart.
Voor dringende zaken: [BACKUP_EMAIL]"
```

---

## Meeting Cancellation

**User:** "Cancel meeting met Piet vrijdag"

**PA:**
```
Meeting met Piet (Vrijdag 28 maart 15:00) annuleren?

Email naar Piet:
"Hoi Piet, helaas moet ik onze afspraak vrijdag annuleren. Kunnen we een nieuwe datum prikken volgende week?"

Versturen + agenda verwijderen?
```

**User:** "Ja"

**PA:** "Meeting geannuleerd, email verzonden naar Piet ✓"

---

## Integration with Email Triage

**When email contains meeting request:**

**Email detected:**
```
From: supplier@company.nl
"Kunnen we volgende maand een keer bellen?"
```

**PA auto-categorizes as "Action - Scheduling"**

**PA drafts:**
```
Beste [SUPPLIER],

In april heb ik deze momenten beschikbaar:

- Dinsdag 1 april: 14:00, 15:30
- Woensdag 2 april: 10:00, 16:00
- Vrijdag 4 april: 11:00, 13:00

Welke tijd past voor jou? Dan plan ik een telefoongesprek in.

Met vriendelijke groet,
[YOUR_NAME]
```

---

## GDPR Compliance

### Calendar Data Access

**Scopes requested:**
- `calendar.readonly` (read events)
- `calendar.events` (create/edit events)

**NOT requested:**
- `calendar.settings` (no access to calendar settings)

### Data Retention

- Meeting history: Kept indefinitely (until user deletes)
- Cancelled meetings: Archived (not deleted, for reference)
- Meeting prep notes: 1 year retention

---

## Anti-Patterns

- ❌ Never double-book meetings (always check conflicts)
- ❌ Never schedule meetings outside working hours (default: 09:00-18:00)
- ❌ Never confirm meetings without user approval (always draft first)
- ❌ Never send calendar invites to no-reply@* addresses
- ❌ Never assume location (always ask: office/online/client location)
- ❌ Never forget buffer time (min 15 minutes between meetings)
