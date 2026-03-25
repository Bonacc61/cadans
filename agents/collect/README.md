# Collect — Collections & Receivables Agent

**Tagline**: Vorder openstaande facturen in zonder ongemak.
**Collect outstanding invoices without awkwardness.**

## Overview

Collect is Cadans' vertical agent for **automated receivables management**. It handles payment reminders, escalation workflows, and debtor communication — maintaining relationships while protecting cash flow.

## Target Personas

- **ZZP'er**: 10-30 invoices/mo, 20% overdue >14 days
- **MKB-Eigenaar**: 100-500 invoices/mo, €50K-200K in receivables
- **Boekhouder**: Managing collections for 20+ clients

## Core Features

### 1. Smart Payment Reminders
- **Friendly first reminder**: Day 15 (1 day overdue) — "Kleine herinnering..."
- **Second reminder**: Day 30 — "Factuur nog niet betaald, alles OK?"
- **Final notice**: Day 45 — "Laatste herinnering voor incasso"
- **Tone adaptation**: Adjusts formality based on client relationship

### 2. Escalation Workflows
- **3-tier system**:
  1. **Automated friendly** (day 15-30)
  2. **Personal intervention alert** (day 31-45) — "Review before sending?"
  3. **Legal handoff** (day 46+) — Export to incassobureau
- **Custom rules**: VIP clients, seasonal businesses, known slow payers

### 3. Payment Plan Negotiation
- **Installment proposals**: "€2.400 in 3 termijnen van €800?"
- **Interest calculation**: Wettelijke rente (statutory interest)
- **Acceptance tracking**: Auto-generate payment plan agreement
- **Reminder per installment**: "Termijn 2/3 vervalt morgen"

### 4. Debtor Communication Analysis
- **Sentiment detection**: "Klant klinkt boos" → escalate to human
- **Dispute flagging**: "Factuur klopt niet" → pause collections
- **Payment promises**: "Betaal vrijdag" → schedule follow-up Monday
- **Bankruptcy signals**: "Bedrijf gestopt" → alert for legal action

### 5. Cash Flow Forecasting
- **Weighted collections**: 90% probability for <14 days overdue, 50% for >30 days
- **Aging report**: "€24K overdue >30 dagen, €8K at risk"
- **Trend analysis**: "Gemiddelde betaaltermijn stijgt van 18 naar 24 dagen"
- **Client score**: Payment behavior over time (0-100)

## Pricing

| Tier | Monthly | Features |
|------|---------|----------|
| **ZZP** | €100 | Up to 50 invoices, automated reminders only |
| **MKB** | €200 | Up to 500 invoices, escalation workflows, reports |
| **Enterprise** | €400 | Unlimited, payment plans, incasso integration |

**Setup fee**: €1,000-2,000 (integration with accounting platform + historical data import)

**Success-based pricing** (optional): €50/mo + 5% of recovered overdue >60 days

**Bundle discount**: PA + Books + Collect = €650/mo (save €150)

## Technical Stack

- **Accounting integration**: Exact Online, Moneybird (invoice + payment status)
- **Email delivery**: SendGrid (DKIM/SPF/DMARC compliant)
- **SMS reminders**: MessageBird (optional, day 45)
- **Document generation**: Aanmaning templates (Dutch legal format)
- **Incasso handoff**: Export to Graydon, Intrum (CSV format)

## Key Workflows

### Automated Reminder Sequence
```
Day 0: Invoice sent (€1.200, payment term 14 days)
Day 15: "Beste Jan, factuur #INV-2026-042 (€1.200) is per vandaag vervallen. Mogelijk over het hoofd gezien?"
Day 22: "Herinnering: factuur #INV-2026-042 is nu 7 dagen te laat. Kunnen we binnenkort betaling verwachten?"
Day 30: "Tweede herinnering: factuur €1.200 nu 15 dagen overdue. Graag binnen 5 dagen."
Day 36: [Alert to user] "Jan reageert niet. Wil je zelf bellen of doorgaan naar finale aanmaning?"
```

### Payment Plan Negotiation
```
Client (email): "Ik kan niet in één keer betalen, kan het in termijnen?"
Collect: "Natuurlijk. Ik stel voor: 3 × €400 op 1 april, 1 mei, 1 juni. Akkoord?"
Client: "Ja, prima"
Collect: [Generates payment plan PDF + sends confirmation]
         [Sets reminders for April 1, May 1, June 1]
```

### Dispute Handling
```
Client: "Die €850 factuur klopt niet, was afgesproken €750"
Collect: [Pauses collections immediately]
         [Alert to user] "⚠️ Dispuut: Bakkerij de Vries betwist factuur #INV-2026-042. Email doorgestuurd."
User: [Reviews, creates credit note for €100]
Collect: "Creditnota verstuurd. Nieuwe factuur €750. Herstart herinneringen?"
```

## Dutch Legal Compliance

### Incasso Regulations
- **First reminder**: No costs chargeable
- **Second reminder**: May include €40 administratiekosten (admin fee)
- **Final notice**: May include wettelijke rente (statutory interest, currently ~11%)
- **Aanmaning format**: Must include payment deadline, consequences, contact info

### GDPR
- **Data retention**: 7 years (financial records)
- **Debtor rights**: Right to access, correct, delete (after retention period)
- **Consent**: Not required (legitimate interest for payment collection)

## Competitive Positioning

| Competitor | Limitation | Cadans Advantage |
|------------|------------|------------------|
| **Exact Online reminders** | Fixed templates, no NLP | **Context-aware, relationship-preserving** |
| **Intrum (incassobureau)** | Expensive (15-20% fee), aggressive | **Friendly first, 5% success fee** |
| **Manual process** | Time-consuming, inconsistent | **Automated, 24/7, consistent** |
| **Zapier automation** | No intelligence, can't negotiate | **AI-powered, handles replies** |

## Success Metrics

- **DSO (Days Sales Outstanding)**: Reduce from 38 to 24 days (pilot avg)
- **Collection rate**: 92% of invoices paid within 45 days (vs 68% baseline)
- **Time saved**: 4-6 hours/week on follow-ups
- **Relationship preservation**: 89% of clients don't churn after collections

## Roadmap

- **Q2 2026**: SMS reminders (day 45)
- **Q3 2026**: WhatsApp collections (opt-in)
- **Q4 2026**: Credit check integration (Graydon API)
- **Q1 2027**: Predictive scoring (which invoices will be late)

## Marketing Positioning

**Headline**: "Betalen zonder zeuren. Automatisch, vriendelijk, effectief."
**Get paid without nagging. Automatic, friendly, effective.**

**Value prop**:
- **For ZZP'ers**: "Nooit meer ongemakkelijk bellen over geld"
- **For SMB owners**: "€50K terug in cashflow binnen 2 maanden" (pilot data)
- **For accountants**: "Beheer debiteurenbeheer voor 20 klanten in 2 uur/week"

**Trust signals**:
- "92% incasso binnen 45 dagen"
- "Klantrelaties behouden, 89% retention"
- "GDPR-compliant, 7 jaar retentie"

**Objection handling**:
- "Is het niet onpersoonlijk?" → "Nee, we passen toon aan per klant. Jij blijft altijd in controle."
- "Wat als klant boos wordt?" → "AI detecteert sentiment, escaleert naar jou voor persoonlijk contact."

## Next Steps

1. **Build reminder template library** (5 tones: friendly, neutral, firm, legal, VIP)
2. **Create demo video** (30-second WhatsApp alert → payment received)
3. **Write case study**: MKB owner recovering €38K in 60 days
4. **Design escalation flow UI** (timeline visualization with `/ui-ux-pro-max`)
