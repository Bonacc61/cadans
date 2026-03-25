# Invoice Automation Skill

## Purpose

Create, send, and track invoices via conversational WhatsApp/email commands.

---

## Invoice Creation

### WhatsApp Command

**User:** "Factuur naar Bakkerij de Vries, €850 voor webshop maandlicentie, betaaltermijn 14 dagen"

**Process:**
1. **Parse intent:** Invoice creation
2. **Extract entities:**
   - Recipient: "Bakkerij de Vries"
   - Amount: €850
   - Description: "webshop maandlicentie"
   - Payment term: 14 dagen
3. **Lookup customer** in accounting platform (Exact/Moneybird)
4. **Confirm details** with user
5. **Generate invoice** via API
6. **Send via email** (with PDF attachment)
7. **Confirm to user**

**Example flow:**

```
User: "Factuur naar Bakkerij de Vries, €850 voor webshop maandlicentie, betaaltermijn 14 dagen"

Books: "Bedoel je: Bakkerij de Vries BV (klant #2401)?
       €850 excl. BTW (21% = €178,50)?
       Totaal: €1.028,50"

User: "Ja"

Books: "Factuur #INV-2026-042 aangemaakt en verstuurd naar info@bakkerij-devries.nl.
       Vervaldatum: 5 april 2026.

       Wil je een kopie?"

User: "Nee, dank je"
```

---

## Invoice Templates

Predefined items for faster invoicing:

**Setup:**
```
User: "Sla template op: Webshop maandlicentie, €850 excl, betaaltermijn 14 dagen"
Books: "Template 'Webshop maandlicentie' opgeslagen."
```

**Usage:**
```
User: "Factuur Bakkerij de Vries, webshop maandlicentie"
Books: "Template gevonden: €850 excl. BTW (21%).
       Verzenden naar info@bakkerij-devries.nl?"
User: "Ja"
```

---

## Automatic Reminders

**Integration with Collect agent:**

When invoice is created, optionally enable auto-reminders:

```
Books: "Factuur #INV-2026-042 aangemaakt.
       Wil je automatische herinneringen inschakelen? (Dag 15/22/30)"

User: "Ja"

Books: "Herinneringen ingeschakeld. Ik waarschuw je als betaling uitblijft."
```

**Cross-agent handoff:**
- Books creates invoice
- Collect monitors payment status
- Collect sends reminders on Day 15/22/30
- Books updates invoice status when paid

---

## Expense Tracking

### Receipt OCR via WhatsApp

**User:** [Sends photo of Albert Heijn receipt]

**Process:**
1. **Detect image** in WhatsApp message
2. **OCR scan** using Taggun API
3. **Extract:**
   - Merchant name
   - Total amount
   - Date
   - VAT breakdown
4. **Ask for category**
5. **Book expense** in accounting platform

**Example flow:**

```
User: [WhatsApp photo of receipt]

Books: "€24,56 bij Albert Heijn op 21 maart.
       Categorie?"

User: "Kantoorbenodigdheden"

Books: "BTW aftrekbaar? (Je hebt post-its en printpapier gekocht)"

User: "Ja"

Books: "Geboekt op 6420 (kantoorbenodigdheden).
       BTW: €4,28 (21%).

       Opgeslagen! ✓"
```

---

## VAT Category Mapping

**Common Dutch expense categories (Rekeningschema NL):**

| Code | Category | VAT Deductible | Example |
|------|----------|----------------|---------|
| 4000 | Inkoop handelsgoederen | ✅ Yes | Inventory purchases |
| 4300 | Verpakkingsmateriaal | ✅ Yes | Shipping boxes |
| 4400 | Onderaanneming | ✅ Yes | Freelancer invoices |
| 6200 | Huisvestingskosten | ✅ Yes | Office rent |
| 6300 | Autokosten | ⚠️ Partial | Fuel (business trips only) |
| 6420 | Kantoorbenodigdheden | ✅ Yes | Post-its, pens, paper |
| 6800 | Maaltijdkosten | ❌ No | Lunch (non-deductible) |
| 6810 | Representatiekosten | ❌ No | Client dinners |

**Smart categorization:**

```
Albert Heijn + food items → 6800 (Maaltijdkosten), BTW NOT deductible
Albert Heijn + office supplies → 6420 (Kantoorbenodigdheden), BTW deductible
Shell + fuel → 6300 (Autokosten), BTW partial (ask user if business trip)
```

---

## Bank Reconciliation

### PSD2 Integration

**Daily import** of bank transactions:

**Process:**
1. **Connect to bank API** (ING/Rabobank/ABN via PSD2)
2. **Fetch new transactions** (since last import)
3. **Match to invoices** (by amount + IBAN)
4. **Flag unmatched** for manual review

**Auto-matching:**

```
Transaction: €1.028,50 from NL12ABNA0123456789
Invoice: #INV-2026-042 to Bakkerij de Vries BV (NL12ABNA0123456789) for €1.028,50

→ Auto-match ✓
→ Mark invoice as PAID
→ Notify user
```

**Unmatched transaction:**

```
Books: "€450 ontvangen van onbekende IBAN NL98RABO0987654321.
       Omschrijving: 'Factuur 123'

       Welke factuur is dit?"

User: "Dat is Jan de Bakker, nieuwe klant"

Books: "Klant 'Jan de Bakker' bestaat niet.
       Aanmaken met IBAN NL98RABO0987654321?"

User: "Ja"

Books: "Klant aangemaakt.
       Wil je een factuur boeken voor €450?"
```

---

## VAT Returns (BTW Aangifte)

### Quarterly Prep

**Timeline:**
- Q1: January-March, due April 30
- Q2: April-June, due July 31
- Q3: July-September, due October 31
- Q4: October-December, due January 31

**Process:**

**2 weeks before deadline:**

```
Books: "📊 Q1 2026 BTW overzicht:

Omzet (hoog tarief 21%): €12.450 → BTW €2.614,50
Inkoop (hoog tarief 21%): €3.200 → BTW €672,00
Omzet (laag tarief 9%): €0
Inkoop (laag tarief 9%): €0

Te betalen: €1.942,50

Wil je de aangifte voorbereiden?"

User: "Ja"

Books: "XML gegenereerd: btw-q1-2026.xml
       Download: [LINK]

       Stappen:
       1. Inloggen op mijnbelastingdienst.nl
       2. BTW aangifte → Importeren
       3. Upload btw-q1-2026.xml
       4. Controleren en verzenden

       Deadline: 30 april 2026"
```

---

## Financial Reporting

### P&L on Demand

**User:** "Hoe staat het er deze maand voor?"

**Books:**
```
📈 Maart 2026 – Winst & Verlies

Omzet: €18.450
Kosten: €6.320
────────────
Winst: €12.130 (66% marge)

Top omzet:
1. Webshop licenties: €9.600 (52%)
2. Consultancy: €5.400 (29%)
3. Hosting: €3.450 (19%)

Top kosten:
1. Onderaanneming: €2.800 (44%)
2. Software/tools: €1.200 (19%)
3. Marketing: €950 (15%)

YTD winst: €34.890
```

---

### Cash Flow Forecast

**User:** "Verwachte liquiditeit over 2 weken?"

**Books:**
```
💰 Cash Flow Prognose (nu → 5 april)

Huidige saldo: €12.450

Verwachte inkomsten:
- #INV-042 (Bakkerij de Vries): €1.028,50 (vervalt 5 apr)
- #INV-038 (Jan's Garage): €2.400 (vervalt 3 apr)
Totaal: €3.428,50

Verwachte uitgaven:
- Hetzner VPS: €45 (1 apr)
- Adobe Creative Cloud: €60 (1 apr)
- Freelancer factuur: €1.200 (3 apr)
Totaal: €1.305

────────────
Verwacht saldo: €14.573,50 (+€2.123,50)

⚠️ Let op: #INV-038 is 12 dagen overdue, mogelijk vertraging.
```

---

## Integrations

### Exact Online

**Authentication:** OAuth 2.0

**API Endpoints:**

**Create invoice:**
```
POST /api/v1/{division}/salesinvoice/SalesInvoices
{
  "InvoiceDate": "2026-03-21",
  "OrderedBy": "{CustomerGUID}",
  "PaymentCondition": "14 dagen",
  "SalesInvoiceLines": [
    {
      "Item": "{ItemGUID}",
      "Quantity": 1,
      "UnitPrice": 850.00,
      "VATCode": "NL_H" // 21% high rate
    }
  ]
}
```

**Fetch bank transactions:**
```
GET /api/v1/{division}/financial/BankEntries
?$filter=EntryDate ge datetime'2026-03-01' and EntryDate lt datetime'2026-04-01'
```

---

### Moneybird

**Authentication:** OAuth 2.0 or API Key

**API Endpoints:**

**Create invoice:**
```
POST /api/v2/{administration_id}/sales_invoices
{
  "sales_invoice": {
    "contact_id": 12345,
    "invoice_date": "2026-03-21",
    "details_attributes": [
      {
        "description": "Webshop maandlicentie",
        "price": "850.00",
        "tax_rate_id": 123456 // 21% BTW
      }
    ]
  }
}
```

---

## GDPR Compliance

### Data Retention

**Dutch tax law:** 7 years retention for financial records

**Stored data:**
- Invoices (PDF + metadata)
- Receipts (images + OCR data)
- Bank transactions
- VAT returns
- Communication logs (WhatsApp messages about invoices)

**After 7 years:** Auto-delete or archive to cold storage

---

### Client Data Access

**User:** "Ik wil alle facturen van Q1 downloaden"

**Books:**
```
Q1 2026 Facturen (22 stuks)

Download als:
1. PDF (zip bestand, 22 facturen)
2. Excel export (bedragen + BTW)
3. CSV (voor import in ander systeem)

Kies optie:
```

---

## Dutch Language Handling

**Keywords:**
- "factuur" = invoice
- "onkosten" / "uitgave" = expense
- "BTW" / "omzetbelasting" = VAT
- "rekening" = account
- "afschrijving" = depreciation
- "balans" = balance sheet
- "winst en verlies" = profit & loss

**Always respond in Dutch**, use formal accounting terms (not slang).

---

## Audit Trail

**Every action logged:**

```
2026-03-21 14:32:15 | Invoice #INV-042 created | User: owner | Amount: €1,028.50
2026-03-21 14:32:18 | Invoice #INV-042 sent to info@bakkerij-devries.nl
2026-03-25 09:15:42 | Expense €24.56 booked | Category: 6420 | OCR: Albert Heijn receipt
2026-04-05 16:20:01 | Payment €1,028.50 matched to INV-042 | Bank: ING | Auto-match
```

**Immutable log** (append-only SQLite table, no deletes).

**User can request audit export** for accountant review.

---

## Anti-Patterns

- ❌ Never book expenses without VAT categorization
- ❌ Never auto-match payments if IBAN doesn't match invoice
- ❌ Never skip wettelijke rente calculation for late invoices
- ❌ Never allow manual VAT rate entry (always use platform's tax codes)
- ❌ Never delete invoices (only credit notes allowed)
- ❌ Never ignore reverse charge for EU suppliers (BTW verlegd)
