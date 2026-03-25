# Support Agent - Development Guide

**Agent Type:** Customer Support Automation
**Complexity:** Medium (FAQ + ML classification + ticket routing)
**Last Updated:** 2026-03-22

---

## Purpose

When working on the Support agent, follow these rules to ensure high auto-resolution rates, proper escalation, and GDPR compliance for customer data.

---

## Auto-Resolution Target: 60%+

**Success = 60-70% of tickets resolved without human intervention**

**Categories that MUST auto-resolve:**
- ✅ Order status lookups (if order ID provided)
- ✅ Shipping cost questions (if country known)
- ✅ Return policy inquiries (standard policy)
- ✅ Password reset requests (standard flow)
- ✅ Stock availability (if SKU/product name provided)
- ✅ FAQ matches (confidence >75%)

**Categories that MUST escalate to human:**
- ❌ Custom product requests
- ❌ Bulk/wholesale inquiries
- ❌ Quality complaints (angry customers)
- ❌ Complex technical issues
- ❌ Legal/GDPR requests (data access, deletion)
- ❌ Refund disputes
- ❌ Chargeback threats

---

## Knowledge Base Setup (CRITICAL)

### Ingestion Process

**Sources (in priority order):**
1. **Website FAQ pages** (highest quality)
2. **Product documentation** (specs, manuals)
3. **Past email threads** (extract Q&A pairs)
4. **Support team notes** (Notion, Google Docs)

**Ingestion command:**
```bash
python3 /root/cadans/agents/support/scripts/ingest_knowledge.py \
  --source website \
  --url {WEBSITE_URL} \
  --client-id {CLIENT_SLUG}
```

**Vector embedding:**
- Model: `text-embedding-3-small` (OpenAI)
- Chunk size: 500-1000 words
- Overlap: 100 words
- Storage: SQLite with JSON (simple) or Pinecone (scale)

---

### Query Matching Thresholds

**Confidence scoring:**
- **>90%:** Auto-respond immediately
- **75-90%:** Auto-respond with "Is dit wat je zocht?" confirmation
- **60-75%:** Show partial match + ask for clarification
- **<60%:** Escalate to human + send to knowledge base team for review

**Example:**
```javascript
const getConfidenceLevel = (cosineSimilarity) => {
  if (cosineSimilarity >= 0.90) return 'high';
  if (cosineSimilarity >= 0.75) return 'medium';
  if (cosineSimilarity >= 0.60) return 'low';
  return 'no_match';
};
```

---

## Language Detection (Dutch/English)

### Auto-Detect Algorithm

**Dutch indicators (score +1 each):**
- Keywords: "hoe", "wat", "kunnen jullie", "ik wil", "graag", "bedankt"
- Question patterns: "Hoe werkt...", "Wat kost...", "Wanneer..."
- Greetings: "Hoi", "Dag", "Beste"

**English indicators (score +1 each):**
- Keywords: "how", "what", "can you", "I want", "please", "thanks"
- Question patterns: "How does...", "What is...", "When..."
- Greetings: "Hi", "Hello", "Dear"

**Decision:**
```javascript
if (dutchScore > englishScore) {
  language = 'nl';
} else if (englishScore > dutchScore) {
  language = 'en';
} else {
  language = '{DEFAULT_LANGUAGE}'; // [PLACEHOLDER: nl or en]
}
```

**ALWAYS respond in same language as customer.**

---

## Sentiment Analysis (MANDATORY)

### Frustration Detection

**High frustration keywords (ESCALATE IMMEDIATELY):**

**Dutch:**
- "onacceptabel", "schandalig", "belachelijk", "dit is de [N]e keer"
- "advocaat", "rechtbank", "klacht indienen"
- "nooit meer", "opzeggen", "annuleer mijn account"

**English:**
- "unacceptable", "ridiculous", "this is the [N]th time"
- "lawyer", "court", "file a complaint"
- "never again", "cancel", "close my account"

**Action:**
1. ✅ Stop automation immediately
2. ✅ Alert human: "⚠️ Boze klant: [NAME] (sentiment score: [X]/100)"
3. ✅ Draft empathetic response (human sends, not auto-send)
4. ❌ NEVER auto-respond to frustrated customers

---

### Positive Sentiment (REVIEW PROMPT)

**High satisfaction keywords:**

**Dutch:**
- "super", "geweldig", "perfect", "top", "uitstekend"
- "heel blij", "erg tevreden", "precies wat ik zocht"

**English:**
- "amazing", "excellent", "perfect", "great", "outstanding"
- "very happy", "exactly what I needed"

**Action:**
1. ✅ Thank customer
2. ✅ Prompt for review: "Wil je je ervaring delen? [REVIEW_LINK]"
3. ✅ Log as success metric
4. ❌ NEVER be pushy (single polite ask only)

---

## Order Tracking Integration

### WooCommerce

**API Endpoint:** `/wp-json/wc/v3/orders/{order_id}`

**Authentication:** Consumer Key + Consumer Secret (OAuth 1.0a)

**Process:**
1. Extract order ID from message (regex: `#?\d{4,6}`)
2. Fetch order via API
3. Get tracking from meta field or shipping plugin (PostNL, DHL)
4. Format response

**Error handling:**
```javascript
if (order.status === 'cancelled') {
  // Don't show tracking, explain cancellation
  return `Bestelling #${orderId} is geannuleerd op ${order.date_cancelled}.`;
}

if (!order.tracking_code) {
  // No tracking yet
  return `Bestelling #${orderId} is ${statusNL[order.status]}, maar nog niet verzonden.`;
}
```

**Status mapping:**
```javascript
const statusNL = {
  'pending': 'in behandeling',
  'processing': 'wordt verwerkt',
  'on-hold': 'on hold (betaling verwacht)',
  'completed': 'voltooid',
  'cancelled': 'geannuleerd',
  'refunded': 'terugbetaald',
  'failed': 'mislukt'
};
```

---

### Shopify

**API Endpoint:** `/admin/api/2024-01/orders/{order_id}.json`

**Authentication:** Admin API access token

**Process:** Similar to WooCommerce

**Tracking URL generation:**
```javascript
const getTrackingUrl = (carrier, trackingNumber) => {
  const carriers = {
    'PostNL': `https://postnl.nl/tracktrace/?B=${trackingNumber}`,
    'DHL': `https://www.dhl.com/nl-nl/home/tracking.html?tracking-id=${trackingNumber}`,
    'DPD': `https://www.dpd.com/nl/nl/ontvangen/track-trace/?parcelnumber=${trackingNumber}`
  };
  return carriers[carrier] || `Tracking: ${trackingNumber}`;
};
```

---

## Appointment Scheduling (Google Calendar)

### Availability Check

**Process:**
1. Customer requests: "Kan ik volgende week woensdag langskomen?"
2. Parse intent: date = "next Wednesday"
3. Query Google Calendar API for that day
4. Find free slots (working hours: {WORK_HOURS_START}-{WORK_HOURS_END})
5. Propose 3 options

**API call:**
```javascript
const calendar = google.calendar('v3');
const response = await calendar.freebusy.query({
  requestBody: {
    timeMin: '2026-03-26T09:00:00+01:00', // Wednesday 9 AM
    timeMax: '2026-03-26T18:00:00+01:00', // Wednesday 6 PM
    items: [{ id: '{CALENDAR_ID}' }] // [PLACEHOLDER]
  }
});
```

---

### Booking Confirmation

**After customer selects time:**
1. ✅ Create Google Calendar event
2. ✅ Send invite to customer email
3. ✅ Add 24h + 2h reminders
4. ✅ Confirm via chat/email

**Event creation:**
```javascript
await calendar.events.insert({
  calendarId: '{CALENDAR_ID}', // [PLACEHOLDER]
  requestBody: {
    summary: `Afspraak met ${customerName}`,
    location: '{DEFAULT_LOCATION}', // [PLACEHOLDER]
    start: { dateTime: '2026-03-26T14:00:00+01:00' },
    end: { dateTime: '2026-03-26T15:00:00+01:00' },
    attendees: [{ email: customerEmail }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 24h before
        { method: 'popup', minutes: 120 }      // 2h before
      ]
    }
  }
});
```

---

## Ticket Triage & Routing

### Auto-Resolution (60%)

**Process:**
1. Classify ticket category (ML or keyword matching)
2. If category in auto-resolve list → Handle immediately
3. Log resolution + close ticket
4. Send confirmation to customer

**Example:**
```javascript
if (category === 'order_status' && orderId) {
  const order = await getOrder(orderId);
  await sendResponse(formatOrderStatus(order));
  await closeTicket(ticketId);
  logMetric('auto_resolved', category);
}
```

---

### Route to Human (30%)

**Process:**
1. Create ticket in helpdesk (Zendesk/Freshdesk)
2. Assign to team member based on category
3. Alert via email/Slack
4. Send holding message to customer

**Zendesk API:**
```javascript
await zendesk.tickets.create({
  subject: customerSubject,
  comment: { body: customerMessage },
  priority: urgency, // 'low', 'normal', 'high', 'urgent'
  tags: [category, 'support_agent'],
  custom_fields: [
    { id: 12345, value: 'from_ai_agent' }
  ]
});
```

---

### Urgent Escalation (10%)

**Triggers:**
- Payment failed but product shipped
- Security concerns (account hacked)
- GDPR requests (data access, deletion)
- Angry customers (sentiment <30%)
- Chargeback threats

**Action:**
1. ✅ Create HIGH priority ticket
2. ✅ Alert owner via WhatsApp immediately
3. ✅ Send empathetic holding message
4. ❌ NEVER auto-respond to urgent issues

---

## Multi-Channel Support

### Email (Gmail/Outlook)

**Fetch via IMAP:**
```javascript
const imap = new Imap({
  user: '{SUPPORT_EMAIL}', // [PLACEHOLDER]
  password: process.env.EMAIL_PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});
```

**Parse + classify + respond + archive**

---

### WhatsApp

**Real-time via Baileys:**
- Voice message transcription (Whisper API)
- Image recognition (product photos)
- Quick replies with buttons

**Voice transcription:**
```javascript
if (message.type === 'audio') {
  const audioBuffer = await downloadMedia(message);
  const transcription = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: 'whisper-1',
    language: 'nl'
  });
  // Process transcription as text query
}
```

---

### Website Chat Widget

**Embedded JavaScript:**
```html
<script>
  window.CadansSupport = {
    clientId: '{CLIENT_SLUG}', // [PLACEHOLDER]
    position: 'bottom-right',
    primaryColor: '{BRAND_COLOR}', // [PLACEHOLDER]
    greeting: '{GREETING_MESSAGE}' // [PLACEHOLDER]
  };
</script>
<script src="https://support.cadans.nl/widget.js"></script>
```

**WebSocket connection for real-time chat**

---

## GDPR Compliance

### Data Collection Notice (MANDATORY)

**First-time website chat users:**
```
Welkom! Ik ben de support-assistent van {COMPANY_NAME}.

Door te chatten ga je akkoord met onze [Privacyverklaring].
We bewaren gesprekken {RETENTION_PERIOD} voor kwaliteitsdoeleinden.

Hoe kan ik je helpen?
```

**Placeholders:**
- `{COMPANY_NAME}` — Replace with client company name
- `{RETENTION_PERIOD}` — Default: "2 jaar" (configurable)

---

### Right to Access

**Customer requests transcript:**
```
User: "Ik wil een kopie van onze chatgeschiedenis"
Support: "Natuurlijk! Ik stuur je volledige gespreksgeschiedenis naar {EMAIL}.
         Je ontvangt het binnen 5 minuten als PDF."
```

**Export format:**
- PDF with chat history
- Includes: timestamps, messages, sentiment scores
- Excludes: Internal notes, ML confidence scores

---

### Right to Deletion

**Customer requests deletion:**
```
User: "Verwijder mijn gegevens"
Support: [PAUSE AUTOMATION]
         [Alert human]: "⚠️ GDPR Verwijderverzoek: {CUSTOMER_NAME}"
         [Human confirms identity + processes deletion]
```

**NEVER auto-delete** (verification required by law)

---

## Configuration Placeholders

### Per-Client Settings

```json
{
  "client_id": "{CLIENT_SLUG}",
  "company_name": "{COMPANY_NAME}",
  "support_email": "{SUPPORT_EMAIL}",
  "default_language": "nl", // [OPTIONS: nl, en]
  "working_hours": {
    "start": "09:00", // [CONFIGURABLE]
    "end": "18:00"    // [CONFIGURABLE]
  },
  "calendar_id": "{GOOGLE_CALENDAR_ID}", // [PLACEHOLDER]
  "default_location": "{OFFICE_ADDRESS}", // [PLACEHOLDER]
  "auto_resolution_threshold": 0.75, // [CONFIGURABLE: 0.60-0.90]
  "integrations": {
    "ecommerce": "{woocommerce|shopify|lightspeed}", // [SELECT ONE]
    "helpdesk": "{zendesk|freshdesk|none}", // [SELECT ONE]
    "calendar": "{google|microsoft365|none}" // [SELECT ONE]
  },
  "gdpr": {
    "retention_period_years": 2, // [CONFIGURABLE: 1-7]
    "privacy_policy_url": "{PRIVACY_URL}" // [PLACEHOLDER]
  },
  "chat_widget": {
    "enabled": true,
    "position": "bottom-right", // [OPTIONS: bottom-right, bottom-left]
    "brand_color": "{BRAND_COLOR}", // [PLACEHOLDER: #HEX]
    "greeting": "{GREETING_MESSAGE}" // [PLACEHOLDER]
  }
}
```

---

## Anti-Patterns (NEVER DO THIS)

### Customer Experience Destroyers
- ❌ NEVER promise delivery dates you can't guarantee
- ❌ NEVER ignore angry customers (always escalate)
- ❌ NEVER give wrong tracking info (verify order ID first)
- ❌ NEVER auto-respond to legal/GDPR requests
- ❌ NEVER use excessive emojis (max 1-2 per message)
- ❌ NEVER skip language detection (Dutch customers expect Dutch)

### Technical Errors
- ❌ NEVER respond if confidence <60% (escalate instead)
- ❌ NEVER auto-close tickets with negative sentiment
- ❌ NEVER send same FAQ twice in same conversation
- ❌ NEVER expose internal ML confidence scores to customers
- ❌ NEVER cache knowledge base >24h (data might be stale)

### GDPR Violations
- ❌ NEVER store chat logs beyond retention period
- ❌ NEVER share customer data across clients
- ❌ NEVER auto-delete GDPR requests (human verification required)
- ❌ NEVER skip data collection notice (first-time users)

---

## Testing Checklist

Before deploying to production:

- [ ] Test FAQ matching (10 common questions, verify >75% confidence)
- [ ] Test order tracking (valid order ID → correct status)
- [ ] Test language detection (Dutch vs English messages)
- [ ] Test sentiment analysis (angry message → escalates to human)
- [ ] Test appointment scheduling (check Google Calendar sync)
- [ ] Verify auto-resolution rate (target: 60%+)
- [ ] Test escalation (urgent issue → immediate WhatsApp alert)
- [ ] Test GDPR: Data access request → PDF export works
- [ ] Test GDPR: Deletion request → human alerted, not auto-processed
- [ ] Test multi-channel (email, WhatsApp, website chat)
- [ ] Verify working hours (no appointments outside {WORK_HOURS})
- [ ] Test voice transcription (Dutch WhatsApp voice message)

---

## Performance Metrics (Track Weekly)

**Target SLAs:**
- First response time: <30 seconds
- Auto-resolution rate: >60%
- Customer satisfaction (CSAT): >4.0/5.0
- Escalation rate: <40%

**Weekly report format:**
```
📊 Support Week {WEEK_NUMBER}

Tickets handled: {TOTAL_COUNT}
- Auto-resolved: {AUTO_COUNT} ({AUTO_PERCENTAGE}%)
- Escalated: {ESCALATED_COUNT} ({ESCALATED_PERCENTAGE}%)

Avg response time: {AVG_RESPONSE_TIME}s
CSAT: {CSAT_SCORE}/5.0 ⭐

Top categories:
1. {CATEGORY_1}: {COUNT_1} tickets
2. {CATEGORY_2}: {COUNT_2} tickets
3. {CATEGORY_3}: {COUNT_3} tickets

Knowledge base gaps (add to KB):
- {UNANSWERED_QUESTION_1}
- {UNANSWERED_QUESTION_2}
```

---

## Support & Maintenance

**Owner:** [DEVELOPER_NAME - PLACEHOLDER]
**Client contact:** [CLIENT_EMAIL - PLACEHOLDER]
**Support tier:** [Standard/Premium/Enterprise - PLACEHOLDER]

**Known issues:**
- WooCommerce API sometimes slow (>5s response) — timeout set to 10s
- Whisper API occasionally fails on Dutch dialects — fallback to text input

**Roadmap:**
- Q3 2026: Live chat widget (website embed)
- Q4 2026: Multi-language (English, German, French)
- Q1 2027: Sentiment-based routing (angry → senior agent)

---

## Changelog

**v1.0.0** (2026-03-22)
- Initial scaffolding
- FAQ automation (vector search RAG)
- Order tracking (WooCommerce/Shopify)
- Appointment scheduling (Google Calendar)
- Sentiment analysis
- Multi-channel support (email, WhatsApp, website chat)
- GDPR compliance (2-year retention, data access/deletion)
