# Reminder Workflow Skill

## Purpose

Automate payment reminders with escalating tone while preserving client relationships.

## Workflow Stages

### Stage 1: Friendly Reminder (Day 15)

**Trigger:** Invoice 1 day overdue

**Tone:** Friendly, assume oversight

**Template:**
```
Beste [Naam],

Kleine herinnering voor factuur #[INVOICE_NUMBER] van €[AMOUNT] (vervaldatum: [DUE_DATE]).

Mogelijk over het hoofd gezien? Geen probleem!

Je kunt betalen via:
- Bankoverschrijving: [IBAN]
- iDEAL-link: [PAYMENT_LINK]

Alvast bedankt!

Met vriendelijke groet,
[COMPANY_NAME]
```

**Actions:**
- Log reminder sent
- Schedule follow-up check (Day 22)
- Do NOT charge admin fee

---

### Stage 2: Second Reminder (Day 22)

**Trigger:** Invoice 7 days overdue, no payment received

**Tone:** Still friendly, but more direct

**Template:**
```
Beste [Naam],

Herinnering: factuur #[INVOICE_NUMBER] (€[AMOUNT]) is nu 7 dagen te laat.

Is er iets mis met de factuur? Laat het ons dan weten, we denken graag mee.

Kunnen we binnenkort betaling verwachten?

Je kunt betalen via:
- Bankoverschrijving: [IBAN]
- iDEAL-link: [PAYMENT_LINK]

Met vriendelijke groet,
[COMPANY_NAME]
```

**Actions:**
- Log second reminder
- Flag for potential dispute (if no response)
- Schedule follow-up check (Day 30)

---

### Stage 3: Final Reminder (Day 30)

**Trigger:** Invoice 15 days overdue

**Tone:** Formal, mention consequences

**Template:**
```
Beste [Naam],

Tweede herinnering: factuur #[INVOICE_NUMBER] is nu 15 dagen vervallen.

Bedrag: €[AMOUNT]
Vervaldatum: [DUE_DATE]
Administratiekosten: €40

Graag betaling binnen 5 werkdagen om verdere incassostappen te voorkomen.

Je kunt betalen via:
- Bankoverschrijving: [IBAN]
- iDEAL-link: [PAYMENT_LINK]

Bij vragen, neem contact op: [EMAIL] / [PHONE]

Met vriendelijke groet,
[COMPANY_NAME]
```

**Actions:**
- Add €40 administratiekosten (Dutch law allows this)
- Log final reminder
- Alert user for manual intervention (Day 36)

---

### Stage 4: Human Intervention Alert (Day 36)

**Trigger:** Invoice 21 days overdue, no response

**Action:** Alert business owner via WhatsApp

**Message:**
```
⚠️ Incasso Alert

Klant: [CLIENT_NAME]
Factuur: #[INVOICE_NUMBER]
Bedrag: €[AMOUNT]
Overdue: 21 dagen

Geen reactie op 3 herinneringen.

Opties:
1. Zelf bellen/mailen
2. Doorgaan naar finale aanmaning
3. Direct naar incassobureau
4. Afschrijven als oninbaar

Wat wil je doen?
```

**Wait for user decision before proceeding.**

---

### Stage 5: Final Notice (Day 46+)

**Trigger:** User approves escalation

**Tone:** Legal, formal

**Template:**
```
[CLIENT_NAME]
[ADDRESS]

Betreft: Laatste aanmaning - Factuur #[INVOICE_NUMBER]

Geachte heer/mevrouw,

Ondanks herhaalde herinneringen hebben wij nog steeds geen betaling ontvangen voor factuur #[INVOICE_NUMBER] (€[AMOUNT], vervaldatum [DUE_DATE]).

Totaal verschuldigd bedrag:
- Hoofdsom: €[AMOUNT]
- Administratiekosten: €40
- Wettelijke rente ([RATE]%): €[INTEREST]
- **Totaal: €[TOTAL]**

**Indien wij binnen 7 dagen geen betaling ontvangen, gaan wij over tot:**
1. Overdracht aan incassobureau
2. Registratie bij BKR/Credit Safe
3. Juridische stappen

Laatste kans om dit minnelijk op te lossen.

Betalen kan via:
- Bankoverschrijving: [IBAN]
- iDEAL-link: [PAYMENT_LINK]

Contact: [EMAIL] / [PHONE]

Met vriendelijke groet,
[COMPANY_NAME]
[AUTHORIZED_SIGNATURE]
```

**Actions:**
- Calculate wettelijke rente (statutory interest)
- Send via registered mail (aangetekend)
- Prepare export for incassobureau if no payment

---

## Payment Plan Negotiation

**Trigger:** Client requests payment plan

**Process:**
1. Acknowledge request immediately
2. Propose 3 installments (max)
3. Generate payment plan PDF
4. Send reminders per installment

**Template:**
```
Beste [Naam],

Natuurlijk kunnen we een betalingsregeling treffen.

Ik stel voor:
- Termijn 1: €[AMOUNT_1] op [DATE_1]
- Termijn 2: €[AMOUNT_2] op [DATE_2]
- Termijn 3: €[AMOUNT_3] on [DATE_3]

Totaal: €[TOTAL] (incl. €[FEE] administratiekosten)

Akkoord? Dan stuur ik je een bevestiging.

Met vriendelijke groet,
[COMPANY_NAME]
```

**Actions:**
- Pause collection workflow
- Set reminders for each installment
- If missed payment → resume escalation

---

## Dispute Handling

**Trigger:** Client disputes invoice

**Keywords:** "klopt niet", "fout", "onjuist", "te veel", "niet ontvangen", "annuleren"

**Action:** Immediate pause + alert user

**WhatsApp Alert:**
```
⚠️ Factuur Dispuut

Klant: [CLIENT_NAME]
Factuur: #[INVOICE_NUMBER]
Bericht: "[CLIENT_MESSAGE]"

INCASSO GEPAUZEERD.

Email doorgestuurd. Graag handmatig afhandelen.
```

**No automated follow-up until dispute resolved.**

---

## Sentiment Detection

**Angry Indicators:** "onacceptabel", "schandalig", "advocaat", "rechtbank", "nooit meer"

**Action:** Escalate immediately to human, pause automation

**Financial Distress Indicators:** "failliet", "bedrijf gestopt", "surseance", "geen geld"

**Action:** Alert user, consider write-off, check bankruptcy register

---

## Success Metrics

Track per client:
- Days Sales Outstanding (DSO)
- Collection rate (% paid within 45 days)
- Escalation rate (% reaching Stage 4+)
- Dispute rate (% flagged as disputed)

Report monthly to user.

---

## Dutch Legal Compliance

### Incasso Regulations
- First reminder: No costs chargeable
- Second reminder: May include €40 administratiekosten
- Final notice: May include wettelijke rente (~11% annually as of 2026)
- Must include payment deadline and contact info

### GDPR
- Retain communication logs for 7 years
- Debtor can request access/deletion (after retention period)
- Legitimate interest for payment collection (no consent needed)

---

## Integration Points

### Accounting Platforms
- **Exact Online API:** Fetch invoice status, payment history
- **Moneybird API:** Same as above

### Email Delivery
- **SendGrid:** Bulk reminders, DKIM/SPF/DMARC
- **Gmail:** Individual reminders (for small clients)

### SMS (Optional)
- **MessageBird:** Day 45 final reminder via SMS

### Incasso Handoff
- **Export format:** CSV with debtor details, invoice history
- **Platforms:** Graydon, Intrum

---

## Configuration Options

Per client, set:
- Reminder schedule (default: Day 15/22/30)
- Tone (friendly/neutral/firm)
- VIP clients (skip automation, alert only)
- Auto-escalate or wait for approval
- Languages (NL/EN)

---

## Anti-Patterns

- ❌ Never send aggressive language in first 2 reminders
- ❌ Never threaten legal action before Day 45
- ❌ Never automate past final notice without user approval
- ❌ Never ignore dispute keywords
- ❌ Never forget to calculate wettelijke rente correctly
