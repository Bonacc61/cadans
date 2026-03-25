# FAQ Automation Skill

## Purpose

Auto-resolve common customer questions using knowledge base + natural language matching.

## Setup Process

### 1. Knowledge Base Ingestion

**Sources:**
- Website content (scrape product pages, support pages)
- Past email threads (extract Q&A pairs)
- Manual FAQ documents (Notion, Google Docs, Markdown)
- Product documentation

**Process:**
1. Convert all sources to plain text
2. Split into chunks (500-1000 words)
3. Generate embeddings (OpenAI text-embedding-3-small)
4. Store in vector database (Pinecone/Chroma/simple SQLite with embeddings)

**Command:**
```bash
python3 /root/cadans/agents/support/scripts/ingest_knowledge.py \
  --source website \
  --url https://client.nl/support \
  --client-id client-slug
```

---

### 2. Query Matching

**When customer asks a question:**

1. **Detect language** (nl/en)
2. **Extract intent keywords**
3. **Search vector DB** for similar chunks (cosine similarity >0.75)
4. **Rank results** by relevance
5. **Generate answer** using top 3 chunks as context

**Example:**

**Customer:** "Leveren jullie in België?"

**Search:** Vector search for "België levering verzending verzendkosten"

**Top match:** "We verzenden naar België en Luxemburg. Verzendkosten: €6,95 voor standaard levering (3-5 werkdagen)."

**Response:**
```
Ja, we leveren in België!

Verzendkosten: €6,95
Levertijd: 3-5 werkdagen (standaard)

Wil je een bestelling plaatsen? Dan kun je bij checkout België als land selecteren.

Heb je nog vragen? Laat het me weten!
```

---

## Common FAQ Categories

### Shipping & Delivery

**Triggers:** "waar is mijn pakket", "track and trace", "levering", "verzending", "niet ontvangen"

**Auto-responses:**
- Shipping costs per country
- Delivery time estimates
- Track & trace lookup (if order ID provided)
- Lost package procedure

### Returns & Refunds

**Triggers:** "retour", "teruggave", "geld terug", "terugsturen", "ruilen"

**Auto-responses:**
- Return policy (14 days, unopened, original packaging)
- How to request return label
- Refund timeline (5-10 workdays)
- Exchange vs refund

### Payment Methods

**Triggers:** "betalen", "betaalmethoden", "ideal", "creditcard", "klarna"

**Auto-responses:**
- Accepted payment methods
- Payment issues troubleshooting
- Invoice/receipt requests
- Subscription billing questions

### Account & Login

**Triggers:** "wachtwoord vergeten", "inloggen lukt niet", "account", "registreren"

**Auto-responses:**
- Password reset instructions
- Account creation steps
- Login troubleshooting
- Privacy settings

### Product Information

**Triggers:** "beschikbaar", "op voorraad", "specificaties", "maat", "kleur"

**Auto-responses:**
- Stock availability
- Product specs (size, color, material)
- Compatibility questions
- Care instructions

---

## Response Templates

### Generic FAQ Answer

```
[ANSWER]

[OPTIONAL: RELATED_LINK]

Helpt dit? Laat het me weten als je nog vragen hebt!
```

### Partial Match (Confidence 60-75%)

```
Ik denk dat je vraag is over [TOPIC], klopt dat?

[ANSWER]

Is dit wat je zocht? Anders kun je je vraag anders formuleren.
```

### No Match (Confidence <60%)

```
Sorry, ik kan je vraag niet direct beantwoorden.

Ik heb je vraag doorgestuurd naar mijn collega's. Je krijgt binnen [RESPONSE_TIME] antwoord via [CHANNEL].

In de tussentijd kun je ook kijken op onze FAQ-pagina: [URL]
```

---

## Order Tracking Integration

### WooCommerce

**API Endpoint:** `/wp-json/wc/v3/orders/{order_id}`

**Process:**
1. Extract order ID from customer message (regex: `#?\d{4,6}`)
2. Fetch order status via API
3. Get tracking info from shipping plugin (PostNL, DHL)
4. Format response

**Example:**

**Customer:** "Waar is mijn bestelling? #3847"

**Response:**
```
Bestelling #3847 (€89,50) is gisteren verzonden via PostNL! 📦

Track & Trace: 3SABCD1234567
Status: Onderweg
Verwachte levering: Morgen voor 17:00

Je kunt je pakket live volgen: https://postnl.nl/tracktrace/?B=3SABCD1234567

Nog vragen? Laat het me weten!
```

### Shopify

**API Endpoint:** `/admin/api/2024-01/orders/{order_id}.json`

Similar process as WooCommerce.

---

## Appointment Scheduling

### Google Calendar Integration

**Process:**
1. Customer requests appointment
2. Fetch availability from Google Calendar API
3. Propose 3 slots
4. Customer selects slot
5. Create event, send invite

**Example:**

**Customer:** "Kan ik volgende week woensdag langskomen?"

**Response:**
```
Woensdag 26 maart heb ik de volgende tijden beschikbaar:

1. 10:00 - 11:00
2. 14:30 - 15:30
3. 16:00 - 17:00

Welke tijd past het beste?
```

**Customer:** "14:30 graag"

**Response:**
```
Perfect! Afspraak gemaakt voor woensdag 26 maart om 14:30.

Locatie: [ADDRESS]
Duur: 1 uur
Google Agenda-uitnodiging gestuurd naar [EMAIL]

Tot dan! 👋
```

---

## Sentiment Analysis

### Frustration Detection

**Keywords:** "onacceptabel", "schandalig", "belachelijk", "dit is de [N]e keer", "advocaat"

**Action:** Escalate to human immediately

**Auto-response:**
```
Ik begrijp je frustratie. Dit verdient persoonlijke aandacht.

Mijn collega [NAME] belt je vandaag nog voor 17:00 om dit op te lossen.

Telefoonnummer: [PHONE]

Sorry voor het ongemak.
```

### Positive Sentiment

**Keywords:** "super", "geweldig", "top", "perfect", "dank je wel"

**Action:** Prompt for review

**Auto-response:**
```
Wat fijn om te horen! 🎉

Wil je je ervaring delen in een review? Het helpt ons enorm:
[REVIEW_LINK]

Bedankt voor je vertrouwen!
```

---

## Ticket Triage

### Auto-Resolve (60% of tickets)

Categories that can be fully automated:
- Order status lookups
- Shipping cost questions
- Return policy inquiries
- Password resets
- Stock availability

**No human intervention needed.**

---

### Route to Human (30% of tickets)

Categories that need human touch:
- Custom product requests
- Bulk orders / wholesale inquiries
- Complaints about quality
- Complex technical issues
- Legal/compliance questions

**Action:** Create ticket in helpdesk, alert team member

---

### Urgent Escalation (10% of tickets)

High-priority issues:
- Payment failed but product shipped
- Security concerns (account hacked)
- Data privacy requests (GDPR)
- Angry customers (sentiment score <30%)
- Chargeback threats

**Action:** Alert owner immediately via WhatsApp

---

## Multi-Channel Support

### Email

- Pull from Gmail/Outlook via IMAP
- Parse subject + body
- Generate response
- Send via SMTP
- Archive thread

### WhatsApp

- Real-time messaging
- Voice message transcription (Whisper API)
- Image recognition (product photos)
- Quick replies with buttons

### Website Chat Widget

- Embedded JavaScript widget
- Real-time WebSocket connection
- Typing indicators
- Conversation history

---

## Performance Metrics

Track per client:
- **Auto-resolution rate:** % of tickets closed without human
- **First response time:** Avg time to first reply
- **Customer satisfaction:** Post-resolution survey (1-5 stars)
- **Escalation rate:** % requiring human intervention

**Target SLAs:**
- First response: <30 seconds
- Auto-resolution: >60%
- CSAT: >4.0/5.0

---

## Knowledge Base Maintenance

### Weekly Updates

- Review unresolved tickets
- Extract new FAQ patterns
- Add to knowledge base
- Re-train embeddings

**Command:**
```bash
python3 /root/cadans/agents/support/scripts/update_kb.py \
  --client-id client-slug \
  --source tickets \
  --date-range last-7-days
```

---

## Dutch vs English Handling

**Auto-detect language** from first message:
- Dutch indicators: "hoe", "wat", "kunnen jullie", "ik wil", "graag"
- English indicators: "how", "what", "can you", "I want", "please"

**Respond in same language.**

**Mixed language:** Default to Dutch (primary market).

---

## GDPR Compliance

### Data Collection Notice

For first-time website chat users:

```
Welkom! Ik ben de support-assistent van [COMPANY].

Door te chatten ga je akkoord met onze [Privacyverklaring].
We bewaren gesprekken 2 jaar voor kwaliteitsdoeleinden.

Hoe kan ik je helpen?
```

### Right to Access

Customer requests transcript:

```
Natuurlijk! Ik stuur je volledige gespreksgeschiedenis naar [EMAIL].

Je ontvangt het binnen 5 minuten.
```

---

## Anti-Patterns

- ❌ Never promise what you can't deliver ("Morgen in huis" if not guaranteed)
- ❌ Never ignore angry customers (always escalate frustration)
- ❌ Never give wrong tracking info (verify order ID first)
- ❌ Never auto-respond to legal/GDPR requests (always human)
- ❌ Never use emojis excessively (max 1-2 per message)
- ❌ Never skip language detection (Dutch customers expect Dutch)
