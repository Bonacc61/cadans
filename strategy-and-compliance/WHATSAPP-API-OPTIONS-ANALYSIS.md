# WhatsApp API Options: Kapso vs Alternatives

**Date:** 2026-03-25
**Question:** Is Kapso worth €27/mo, or should we use free alternatives?
**Answer:** Depends on risk tolerance - Meta Cloud API (FREE) is best, Baileys is risky

---

## Executive Summary

**Kapso Cost:** $29/mo (~€27/mo) per WhatsApp number

**Your Question:** "Can we ditch Kapso to avoid eating into margin?"

**Answer:** ✅ **YES - Use Meta WhatsApp Cloud API DIRECTLY (FREE)**

**Key Finding:** Meta's official Cloud API is **completely free** for service conversations (when customers initiate). You don't need Kapso as a middleman.

---

## The Three Options

### Option 1: Meta WhatsApp Cloud API (Direct) ✅ RECOMMENDED

**Cost:** **FREE** (for service conversations = when customer messages you first)

**What Changed in 2024:**
> "Starting November 1, 2024, Meta removed the monthly cap of 1,000 free Service conversations. Now, all user-initiated Service conversations are completely free and unlimited."

**Translation:** If customer messages you first, your reply is FREE. Forever. Unlimited.

**Setup Complexity:** Medium (need Meta Business Manager, phone number verification)

**Ban Risk:** ZERO (official API)

**Margin Impact:** ✅ **No cost = 100% margin preserved**

---

### Option 2: Kapso CLI (Meta Cloud API Wrapper) ⚠️ MIDDLE GROUND

**Cost:** $29/mo per number (~€27/mo)

**What Kapso Provides:**
- Easier setup (handles Meta verification for you)
- CLI interface (simpler than Meta's API)
- Webhooks pre-configured
- QR code generation for linking

**What You're Paying For:** Convenience + abstraction layer

**Ban Risk:** ZERO (uses official Meta API under the hood)

**Margin Impact:**
- Shared tier (€49/mo): €27 cost = **45% margin loss**
- Private tier (€99/mo): €27 cost = **27% margin loss**
- Enterprise tier (€499/mo): €27 cost = **5% margin loss**

**Verdict:** Only worth it if setup time savings > €27/mo value

---

### Option 3: Baileys / whatsapp-web.js (Unofficial) ❌ HIGH RISK

**Cost:** FREE (open source)

**How It Works:** Reverse-engineered WhatsApp Web protocol (WebSocket-based)

**Pros:**
- ✅ Completely free
- ✅ Open source (MIT license)
- ✅ Active development (2025 updates)
- ✅ Multi-session support
- ✅ No Meta approval needed

**Cons:**
- ❌ **HIGH BAN RISK** (not officially supported by Meta)
- ❌ Against WhatsApp Terms of Service
- ❌ Can break anytime (Meta changes protocol)
- ❌ No support from Meta
- ❌ Requires "linked device" (like WhatsApp Web)

**Disclaimer from Baileys:**
> "This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries."

**Real-World Risk:**
- Used by bots, spammers, automation tools
- Meta actively bans accounts using unofficial APIs
- If customer's WhatsApp gets banned → they blame YOU → churn + bad review

**Margin Impact:** FREE, but **customer churn risk = -€588/year LTV**

**Verdict:** ❌ Not worth the risk for a paid product

---

## Deep Dive: Meta WhatsApp Cloud API (Direct)

### Pricing Breakdown (As of 2025)

**Service Conversations (Customer Initiates):**
- **Cost:** FREE (unlimited)
- **Example:** Customer sends "Hi, schedule meeting" → You reply → FREE

**Marketing Conversations (You Initiate):**
- **Cost:** Varies by country
- **Netherlands:** ~€0.05 per conversation
- **Example:** You send "Your meeting is tomorrow" (not in reply) → €0.05

**Utility Conversations (Transactional):**
- **Cost:** Varies by country
- **Netherlands:** ~€0.03 per conversation
- **Example:** You send "Payment received" → €0.03

**Authentication Conversations (OTP/2FA):**
- **Cost:** FREE (up to certain volume)

### What's a "Conversation"?

**Meta's Definition:**
> "A 24-hour messaging session initiated by either the business or the customer."

**Example:**
```
10:00 AM - Customer: "Hi"
10:01 AM - You: "Hello! How can I help?"
10:05 AM - Customer: "Schedule meeting"
10:06 AM - You: "Sure, when?"
10:10 AM - Customer: "Tomorrow 2pm"
10:11 AM - You: "Done! Meeting at 2pm tomorrow."

Cost: FREE (1 service conversation, customer initiated)
```

**Next Day:**
```
2:00 PM - You: "Reminder: Meeting in 5 minutes"

Cost: €0.03 (1 utility conversation, you initiated outside 24-hour window)
```

### Expected Costs for Cadans Use Case

**Typical Customer Usage:**
- Customer sends 10 messages/day (initiates conversation)
- You reply 10 times (within 24-hour window)
- **Cost:** FREE

**Proactive Reminders:**
- You send 3 reminders/day (outside 24-hour window)
- **Cost:** 3 × €0.03 = €0.09/day = €2.70/month

**Total Cost Per Customer:** €2.70/month (vs Kapso's €27/month = **90% cheaper**)

---

## Setup Comparison: Kapso vs Direct Meta API

### Kapso Setup (Easy)

**Time:** 10 minutes

**Steps:**
1. Sign up at kapso.ai
2. Add payment method ($29/mo)
3. Run: `npm install -g @kapso/cli`
4. Run: `kapso numbers create --country NL`
5. Get QR code for customer to scan
6. Done

**Developer Experience:** ⭐⭐⭐⭐⭐ (5/5) - Super easy

---

### Direct Meta Cloud API Setup (Medium)

**Time:** 30-60 minutes (one-time setup)

**Steps:**

**1. Create Meta Business Account**
- Go to business.facebook.com
- Create Business Manager account
- Add business details

**2. Create WhatsApp Business Account (WABA)**
- In Business Manager, go to Business Settings
- Add WhatsApp Business Account
- Verify business (upload business registration docs)

**3. Add Phone Number**
- Add phone number to WABA
- Verify via SMS (receive code on phone)
- Port existing number or get new one from Meta

**4. Get API Access**
- Create Meta App in developers.facebook.com
- Add WhatsApp product
- Generate access token (permanent)
- Set up webhook URL

**5. Test API**
```bash
curl -X POST "https://graph.facebook.com/v21.0/FROM_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "RECIPIENT_PHONE",
    "type": "text",
    "text": { "body": "Test message" }
  }'
```

**Developer Experience:** ⭐⭐⭐ (3/5) - Moderate complexity, but one-time

---

## Code Comparison: Sending a Message

### With Kapso

```typescript
import { Kapso } from '@kapso/sdk';

const kapso = new Kapso({ apiKey: process.env.KAPSO_API_KEY });

await kapso.messages.send({
  from: whatsappNumber,
  to: customerPhone,
  text: 'Your meeting is scheduled for tomorrow at 2pm'
});
```

**Lines of Code:** 3

---

### With Direct Meta API

```typescript
import axios from 'axios';

await axios.post(
  `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
  {
    messaging_product: 'whatsapp',
    to: customerPhone,
    type: 'text',
    text: { body: 'Your meeting is scheduled for tomorrow at 2pm' }
  },
  {
    headers: {
      'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
);
```

**Lines of Code:** 6

**Difference:** 3 extra lines, but saves €27/mo

---

## Cost Analysis: Kapso vs Direct Meta API

### Shared Tier (€49/mo)

**With Kapso:**
- Revenue: €49/mo
- WhatsApp cost: €27/mo
- Other costs: €5/mo (VPS share)
- **Gross Profit:** €17/mo (35% margin)

**With Direct Meta API:**
- Revenue: €49/mo
- WhatsApp cost: €2.70/mo (proactive messages only)
- Other costs: €5/mo (VPS share)
- **Gross Profit:** €41.30/mo (84% margin)**

**Improvement:** +€24.30/mo per customer = +€291.60/year

**At 40 Shared tier customers:** +€11,664/year extra profit

---

### Private Tier (€99/mo)

**With Kapso:**
- Revenue: €99/mo
- WhatsApp cost: €27/mo
- Other costs: €10/mo
- **Gross Profit:** €62/mo (63% margin)

**With Direct Meta API:**
- Revenue: €99/mo
- WhatsApp cost: €2.70/mo
- Other costs: €10/mo
- **Gross Profit:** €86.30/mo (87% margin)**

**Improvement:** +€24.30/mo per customer

---

## Technical Implementation: Direct Meta API

### Step 1: Create WhatsApp Channel Integration

```typescript
// /root/cadans/platform/src/channels/meta-whatsapp.ts

import axios from 'axios';

export class MetaWhatsAppChannel {
  private phoneNumberId: string;
  private accessToken: string;
  private baseUrl = 'https://graph.facebook.com/v21.0';

  constructor(phoneNumberId: string, accessToken: string) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
  }

  async sendMessage(to: string, message: string): Promise<void> {
    await axios.post(
      `${this.baseUrl}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  async sendTemplate(to: string, templateName: string, params: any[]): Promise<void> {
    await axios.post(
      `${this.baseUrl}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'nl' },
          components: [
            {
              type: 'body',
              parameters: params.map(p => ({ type: 'text', text: p }))
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  async handleWebhook(req: any): Promise<void> {
    const body = req.body;

    // Verify webhook (Meta security requirement)
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === process.env.WEBHOOK_VERIFY_TOKEN) {
      return req.query['hub.challenge'];
    }

    // Handle incoming message
    if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from; // Customer phone number
      const text = message.text.body;

      // Route to NanoClaw
      await nanoClawRouter.handleWhatsAppMessage({
        from,
        text,
        timestamp: message.timestamp
      });
    }
  }
}
```

**Complexity:** Similar to Kapso, just different API endpoints

---

### Step 2: Customer Onboarding (QR Code)

**Problem:** Meta Cloud API doesn't provide QR code for linking (that's a Kapso feature)

**Solution:** Customer uses their existing WhatsApp Business number

**Flow:**

```
1. Customer signs up on cadans.nl
2. We provision WhatsApp number via Meta API
3. Customer sees: "Send a message to +31 6 1234 5678 to activate"
4. Customer sends "Hi" from their WhatsApp
5. Webhook fires → We capture their number → Connected!
```

**Alternative (If Customer Doesn't Have WhatsApp Business):**

```
1. We provision number via Meta
2. Customer downloads WhatsApp Business app
3. Customer uses OUR number (we port existing number or get new one from Meta)
4. Customer scans QR code in WhatsApp Business app
5. Connected!
```

**QR Code Generation (DIY):**

```typescript
import QRCode from 'qrcode';

const qrCodeUrl = `https://wa.me/${whatsappNumber}?text=activate`;
const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);

// Show to customer
<img src={qrCodeDataUrl} alt="Scan to activate WhatsApp" />
```

**This is simpler than Kapso's linking, but still works!**

---

## Feasibility: Ditching Kapso

### Can We Ditch Kapso? ✅ YES

**Requirements:**
1. ✅ Direct API access (Meta provides for free)
2. ✅ Webhook handling (we can build in 1 day)
3. ✅ Message sending (simple HTTP POST)
4. ✅ Message receiving (webhook endpoint)
5. ⚠️ QR code linking (need workaround - see above)

**What We Lose:**
- Kapso's CLI convenience
- Pre-configured webhooks
- Fancy QR code linking flow

**What We Gain:**
- €24.30/mo per customer (€291.60/year)
- No vendor lock-in
- Direct control over API

**Time to Implement:** 2-3 days (one-time)

**Break-Even:** After 1 customer (saves €24.30/mo forever)

---

## Recommendation

### For MVP Launch (First 10 Customers): Use Direct Meta API ✅

**Why:**
1. **Margin preservation:** 84% margin vs 35% with Kapso
2. **No vendor lock-in:** Own the integration
3. **Scalability:** Free unlimited service conversations
4. **One-time setup:** 30-60 min upfront, then forever free

**Setup Cost:** 30-60 min (one-time)

**Ongoing Cost:** €2.70/mo per customer (proactive messages only)

**ROI:** Saves €24.30/mo per customer = **€11,664/year at 40 customers**

---

### When to Consider Kapso: Only If You're Lazy ⚠️

**Use Kapso if:**
- You want to launch in 1 day (not 3 days)
- You value convenience > margin
- You're testing with 1-2 customers (€54/mo cost = negligible)

**Don't use Kapso if:**
- You're scaling to 10+ customers (€270/mo cost = significant)
- You care about margins (Kapso eats 45-55% margin)
- You want long-term control

---

### Baileys: Never Use ❌

**Why:**
- HIGH BAN RISK (customers get banned = you lose LTV)
- Against WhatsApp ToS (legal risk)
- Unreliable (Meta can break it anytime)
- Bad customer experience (banned accounts)

**Only exception:** Internal testing/experimentation (not production)

---

## Implementation Plan: Direct Meta API

### Week 1: Meta Account Setup (You)

**Day 1:**
- Create Meta Business Manager account
- Create WhatsApp Business Account (WABA)
- Verify business (upload registration docs)

**Day 2:**
- Add phone number to WABA (get new Dutch number from Meta)
- Verify via SMS
- Create Meta App, add WhatsApp product

**Day 3:**
- Generate permanent access token
- Set up webhook URL (https://cadans.nl/api/webhooks/meta-whatsapp)
- Test sending/receiving messages

**Result:** WhatsApp API ready for YOUR personal use

---

### Week 2: Build Integration (Code)

**File:** `/root/cadans/platform/src/channels/meta-whatsapp.ts`

**Features:**
- Send text messages
- Send template messages (pre-approved by Meta)
- Receive messages via webhook
- Handle delivery receipts
- Error handling

**Testing:**
- Send message to yourself
- Reply from WhatsApp → webhook receives it
- Verify 24-hour window (messages are free)

**Result:** Integration ready for customers

---

### Week 3: Customer Onboarding Flow

**Option A: Customer Uses Their Own WhatsApp**

```
1. Customer signs up
2. We show: "Send 'activate' to +31 6 YOUR_NUMBER"
3. Customer sends message from their WhatsApp
4. Webhook captures their number → connected!
```

**Option B: We Provision Number for Customer**

```
1. Customer signs up
2. We create new WABA sub-account for them (Meta API)
3. We provision new Dutch number for them
4. Customer downloads WhatsApp Business, verifies number
5. Connected!
```

**Recommendation:** Option A (simpler, customer uses existing WhatsApp)

---

## Cost Comparison Summary

| Metric | Kapso | Direct Meta API | Baileys |
|--------|-------|-----------------|---------|
| **Setup Time** | 10 min | 60 min | 30 min |
| **Monthly Cost** | €27/customer | €2.70/customer | FREE |
| **Ban Risk** | ZERO | ZERO | HIGH |
| **Reliability** | High | High | Medium |
| **Margin Impact (Shared)** | -55% | -5% | 0% |
| **Margin Impact (Private)** | -27% | -3% | 0% |
| **Vendor Lock-In** | Yes | No | No |
| **Scalability** | Limited by cost | Unlimited | Unlimited* |

**Verdict:** Direct Meta API wins on cost, margin, and scalability.

---

## Final Answer to Your Question

> "How feasible is it to vibe check Kapso CLI? Cause I don't want 29 EUR of Kapso WhatsApp costs to eat into my margin"

**Answer:**

✅ **100% FEASIBLE to ditch Kapso**

**Use Meta WhatsApp Cloud API directly:**
- Cost: €2.70/mo per customer (vs €27/mo with Kapso)
- Saves: €24.30/mo per customer (€291.60/year)
- Setup: 60 min one-time (vs 10 min with Kapso)
- Margin: 84% (vs 35% with Kapso)

**Action Plan:**
1. Spend 60 min setting up Meta Cloud API (this week)
2. Build integration (3 days next week)
3. Test on yourself (Day 4-5)
4. Launch to customers (Week 3)

**ROI:** Saves €11,664/year at 40 customers (vs Kapso)

**Recommendation:** Skip Kapso entirely, use Meta Cloud API directly.

**Only use Kapso if:** You're impatient and want to launch TODAY (but you'll regret it at 10+ customers when you see €270/mo WhatsApp bills).

---

## Next Steps

**Want me to:**
1. Build Meta Cloud API integration right now (3 days work)?
2. Create step-by-step Meta account setup guide (for YOUR setup this week)?
3. Build hybrid (Kapso for testing, migrate to Meta for production)?

**Your call!**

