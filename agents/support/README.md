# Support — Customer Support Automation

**Tagline**: Klantenservice die altijd beschikbaar is. Zonder wachtrij.
**Customer support that's always available. No queue.**

## Overview

Support is Cadans' vertical agent for **automated customer service**. It handles common questions, ticket routing, and knowledge base queries — reducing response time from hours to seconds.

## Target Personas

- **E-commerce owner**: 50-500 orders/month, repetitive "Waar is mijn pakket?" questions
- **SaaS founder**: 10-100 users, FAQ overload ("Hoe reset ik mijn wachtwoord?")
- **Service business**: Appointment booking, availability questions, rescheduling

## Core Features

### 1. FAQ Automation
- **Knowledge base ingestion**: Upload docs, website, past tickets
- **Natural language matching**: "Leveren jullie in België?" → "Ja, €6,95 verzendkosten"
- **Multi-channel**: Email, WhatsApp, website chatbot, Telegram
- **Dutch + English**: Auto-detect language, respond accordingly

### 2. Order Tracking
- **Integration**: WooCommerce, Shopify, Lightspeed
- **Status lookup**: "Bestelling #3847" → "Verzonden via PostNL, verwacht morgen"
- **Proactive updates**: "Je pakket is bezorgd om 14:32"
- **Return handling**: "Retour aanvragen" → generates return label

### 3. Appointment Scheduling
- **Availability check**: "Volgende week woensdag?" → "10:00, 14:30, of 16:00 beschikbaar"
- **Booking confirmation**: Auto-send Google Calendar invite
- **Reminders**: 24h + 2h before appointment
- **Rescheduling**: "Kan ik verzetten naar donderdag?" → finds alternative slot

### 4. Ticket Triage & Routing
- **Smart categorization**: Refund / Technical / Sales / Complaint
- **Urgency detection**: "Storing" / "Dringend" → flag as high priority
- **Auto-resolve**: 60% of tickets (simple FAQ, status checks)
- **Human handoff**: "Dit is te complex, collega belt je vandaag nog"

### 5. Sentiment Analysis
- **Frustration detection**: "Dit is de 3e keer dat ik mail!" → escalate
- **Satisfaction tracking**: Post-resolution survey (1-5 stars)
- **Review prompting**: Happy customers → "Wil je een review achterlaten?"
- **Churn prevention**: Angry customers → alert owner immediately

## Pricing

| Tier | Monthly | Features |
|------|---------|----------|
| **Starter** | €150 | 1 channel, 200 tickets/mo, FAQ only |
| **Growth** | €300 | 3 channels, 1,000 tickets/mo, order tracking |
| **Enterprise** | €600 | Unlimited channels/tickets, custom integrations |

**Setup fee**: €1,500-3,500 (knowledge base creation + platform integration)

**Pay-per-ticket** (optional): €75/mo + €0,50/ticket (for seasonal businesses)

**Bundle discount**: PA + Support = €500/mo (save €100)

## Technical Stack

- **Platforms**: Zendesk API, Freshdesk API, Gorgias (Shopify), custom
- **E-commerce**: WooCommerce, Shopify, Lightspeed APIs
- **Shipping**: PostNL, DHL, DPD tracking APIs
- **Chatbot embed**: JavaScript widget (website), WhatsApp Business API
- **Knowledge base**: Vector search (OpenAI embeddings), RAG pipeline

## Key Workflows

### Order Status Inquiry
```
Customer (WhatsApp): "Waar is mijn bestelling? #3847"
Support: "Bestelling #3847 (€89,50) is gisteren verzonden via PostNL.
         Track & Trace: 3SABCD1234567
         Verwachte levering: morgen voor 17:00"
Customer: "Thanks!"
Support: [Auto-closes ticket, logs resolution time: 8 seconds]
```

### FAQ with Escalation
```
Customer (email): "Accepteren jullie American Express?"
Support: "Momenteel accepteren we Visa, Mastercard, iDEAL, en PayPal. American Express is in ontwikkeling voor Q3 2026."
Customer: "Kan ik ook achteraf betalen?"
Support: "Ja, via Klarna (bij bestelling >€50). Wil je dat ik een testlink stuur?"
Customer: "Nee, ik heb een vraag over retourbeleid voor custom producten"
Support: [Detects complexity] "Dat is maatwerk-specifiek. Ik verbind je door met Marieke (sales). Zij belt je vandaag nog. Telefoonnummer?"
```

### Appointment Rescheduling
```
Customer (WhatsApp): "Ik moet afspraak donderdag 14:00 verzetten"
Support: "Begrepen. Welke dag past beter?"
Customer: "Vrijdag?"
Support: "Vrijdag beschikbaar: 10:00, 13:30, 16:00. Voorkeur?"
Customer: "10:00"
Support: "Afspraak verzet naar vrijdag 23 maart, 10:00. Bevestiging in je mail. Tot dan!"
[Updates Google Calendar, sends new invite, cancels old slot]
```

### Complaint Escalation
```
Customer (email): "Dit is de 3e keer dat jullie mijn bestelling verkeerd leveren. Onacceptabel!"
Support: [Sentiment: highly negative, keywords: "3e keer", "onacceptabel"]
         [Auto-escalates to owner]
         [Reply to customer]: "Mijn oprechte excuses. Dit is niet onze standaard. Eigenaar belt je binnen 1 uur. Tel: 06-12345678"
[Alert to owner via WhatsApp]: "⚠️ Klacht van klant #8471 (3e incident). Email doorgestuurd. Terugbellen binnen 1u toegezegd."
```

## Integrations

| Platform | Type | Status | Market Share (NL) |
|----------|------|--------|-------------------|
| **WooCommerce** | E-commerce | ✅ Live | 28% |
| **Shopify** | E-commerce | ✅ Live | 22% |
| **Lightspeed** | Retail POS | 🔄 Roadmap | 18% |
| **Zendesk** | Helpdesk | ✅ Live | 35% |
| **Freshdesk** | Helpdesk | 🔄 Roadmap | 15% |
| **Gorgias** | Shopify support | 🔄 Roadmap | 12% (Shopify users) |

## Performance Metrics

- **First response time**: <30 seconds (vs 4-6 hours human avg)
- **Auto-resolution rate**: 60-70% of tickets
- **Customer satisfaction**: 4.2/5 stars (post-resolution survey)
- **Cost savings**: €1.200/mo (vs €2.500 for 20h/week human support)

## Competitive Positioning

| Competitor | Limitation | Cadans Advantage |
|------------|------------|------------------|
| **Zendesk AI** | English-only, expensive ($50/agent) | **Dutch fluency, €150-600/mo** |
| **Chatbot.com** | No email/WhatsApp, rigid flows | **Omnichannel, conversational** |
| **Human support** | €15-25/hr, limited hours | **24/7, instant, €0,15-0,30/ticket** |
| **Intercom** | Enterprise pricing ($74/seat) | **SMB-focused, €150 entry** |

## Compliance

- **GDPR**: Customer data encrypted, 2-year retention (configurable)
- **Right to human**: "Ik wil een mens spreken" → immediate escalation
- **Audit trail**: All conversations logged, exportable
- **Opt-out**: "Stop deze berichten" → unsubscribe immediately

## Roadmap

- **Q2 2026**: Voice support (phone transcription → ticket)
- **Q3 2026**: Live chat widget (website embed)
- **Q4 2026**: Multi-language (English, German, French)
- **Q1 2027**: Sentiment-based routing (angry → senior agent)

## Marketing Positioning

**Headline**: "60% van je klantvragen beantwoord voordat jij wakker bent"
**60% of customer questions answered before you wake up**

**Value prop**:
- **For e-commerce**: "Stop met 'Waar is mijn pakket?' emails. Automatisch beantwoord."
- **For SaaS**: "FAQ op WhatsApp. Klanten blij, jij vrij."
- **For service businesses**: "Afspraken boeken om 23:00. Waarom niet?"

**Trust signals**:
- "4.2/5 klanttevredenheid (vs 3.8 voor menselijke support)"
- "<30 sec responstijd, 24/7"
- "60-70% tickets automatisch opgelost"

**Objection handling**:
- "Klinkt onpersoonlijk" → "Nee, AI leert jouw tone of voice. Klinkt als jouw team."
- "Wat als AI het fout doet?" → "Bij twijfel escaleert het naar mens. Nooit valse beloftes."

## Use Cases by Industry

### E-commerce (webshop)
- Order status, returns, shipping costs, product availability
- **Example**: Jewelry webshop, 300 orders/mo, 180 "Waar is mijn pakket?" emails → 95% auto-resolved

### SaaS (software)
- Password resets, feature questions, billing inquiries
- **Example**: Project management tool, 50 users, 40 tickets/mo → 25 auto-resolved (FAQ)

### Professional services (consultancy, legal)
- Appointment booking, document requests, availability
- **Example**: Accountant, 80 clients, 100 emails/mo "Wanneer kan ik langskomen?" → 70 auto-scheduled

### Healthcare (private clinics)
- Appointment scheduling, insurance questions, intake forms
- **Example**: Physiotherapy, 200 appointments/mo, 50% booked via WhatsApp outside office hours

## Next Steps

1. **Build knowledge base template** (50 common Dutch SMB FAQs)
2. **Create WooCommerce demo** (live order tracking integration)
3. **Design chatbot widget** (website embed with `/ui-ux-pro-max`)
4. **Write case study**: Webshop reducing support costs by 65%
