# Books — Bookkeeping Assistant

**Tagline**: Boekhouden zonder gedoe. Factureren, onkosten, BTW — geregeld.
**Bookkeeping without hassle. Invoicing, expenses, VAT — sorted.**

## Overview

Books is Cadans' vertical agent for **SMB bookkeeping automation**. It connects to Exact Online, Twinfield, or Moneybird to handle invoicing, expense tracking, VAT returns, and financial reporting — in plain Dutch.

## Target Personas

- **ZZP'er**: Self-employed, 10-50 invoices/month, DIY bookkeeping
- **MKB-Eigenaar**: SMB owner with bookkeeper, wants real-time insights
- **Boekhouder**: Accountant managing 20-100 clients, needs efficiency

## Core Features

### 1. Invoice Automation
- **Email → Invoice**: "Stuur factuur €1.250 excl. BTW aan Jan de Vries voor website ontwikkeling"
- **Template management**: Predefined items, hourly rates, payment terms
- **Send + track**: Auto-reminder after 14/30 days overdue
- **PDF generation**: Dutch format, logo, bank details

### 2. Expense Tracking
- **Receipt OCR**: WhatsApp photo → expense entry (Taggun API)
- **Category mapping**: "Lunch met klant" → 6420 (representatie)
- **VAT extraction**: High/low rate, non-deductible
- **Approval workflow**: Flag expenses >€100 for review

### 3. Bank Reconciliation
- **Transaction import**: ING, Rabobank, ABN AMRO (PSD2 API)
- **Smart matching**: Auto-link payments to invoices
- **Unmatched alerts**: "€450 van onbekende IBAN, wie is dit?"
- **Daily summary**: "Vandaag binnen: €2.340, uitgegaan: €890"

### 4. VAT Returns (BTW Aangifte)
- **Quarterly prep**: "Je Q1 BTW is €3.240 te betalen"
- **Omzetbelasting 1a/1b/1c**: Auto-categorization
- **Reverse charge**: EU suppliers (verlegd)
- **Pre-filled XML**: Import to Belastingdienst portal

### 5. Financial Reporting
- **P&L on demand**: "Hoe staat het er deze maand voor?"
- **Cash flow forecast**: "Verwachte liquiditeit over 2 weken?"
- **Burn rate**: For startups with runway tracking
- **Year-end prep**: Export for accountant (Excel, CSV)

## Pricing

| Tier | Monthly | Features |
|------|---------|----------|
| **ZZP** | €150 | 1 company, 50 invoices/mo, 1 bank account |
| **MKB** | €250 | 1 company, 200 invoices/mo, 3 bank accounts |
| **Boekhouder** | €600 | 10 companies (€60/ea), multi-tenant, white-label |

**Setup fee**: €1,500-3,000 (Exact/Twinfield integration + chart of accounts mapping)

**Bundle discount**: PA + Books = €500/mo (save €100)

## Technical Stack

- **Accounting platforms**: Exact Online API, Moneybird API, Twinfield SOAP
- **Bank APIs**: PSD2 (ING, Rabobank, ABN AMRO)
- **OCR**: Taggun (receipt scanning), Tesseract (fallback)
- **PDF generation**: Puppeteer (HTML → PDF)
- **Storage**: Per-client LUKS encrypted volumes (€0.10/GB)

## Key Workflows

### Invoice Creation via WhatsApp
```
User: "Factuur naar Bakkerij de Vries, €850 voor webshop maandlicentie, betaaltermijn 14 dagen"
Books: "Bedoel je: Bakkerij de Vries BV (factuur #2401)? €850 excl. BTW (21% = €178,50)?"
User: "Ja"
Books: "Factuur #INV-2026-042 aangemaakt en verstuurd naar info@bakkerij-devries.nl. Vervaldatum 5 april."
```

### Expense from Receipt
```
User: [WhatsApp photo of Albert Heijn receipt]
Books: "€24,56 bij Albert Heijn. Categorie?"
User: "Kantoorbenodigdheden"
Books: "Geboekt op 6420 (kantoorbenodigdheden), BTW €4,28 (21%). Non-deductible (food/drink)?"
User: "Nee, post-its en printpapier"
Books: "OK, BTW aftrekbaar. Opgeslagen."
```

### Monthly VAT Check
```
Books: "📊 Maart BTW overzicht:
- Omzet: €12.450 (BTW €2.614,50)
- Inkoop: €3.200 (BTW €672)
- Te betalen: €1.942,50
Aangifte doen?"
User: "Ja"
Books: "XML gegenereerd. Download: [link]. Inloggen op mijnbelastingdienst.nl en importeren."
```

## Integrations

| Platform | API | Status | Market Share (NL) |
|----------|-----|--------|-------------------|
| **Exact Online** | REST | ✅ Live | 38% (SMB) |
| **Moneybird** | REST | ✅ Live | 22% (ZZP) |
| **Twinfield** | SOAP | 🔄 Roadmap | 18% (Enterprise) |
| **SnelStart** | REST | 🔄 Roadmap | 12% (Retail) |

## Compliance

- **GDPR**: Financial data encrypted at rest (LUKS) + in transit (TLS 1.3)
- **NEN 7510**: Healthcare clients (medical practices)
- **Audit trail**: Immutable log of all transactions (append-only SQLite)
- **Retention**: 7 years (Dutch tax law)

## Competitive Positioning

| Competitor | Limitation | Cadans Advantage |
|------------|------------|------------------|
| Moneybird AI | No WhatsApp, basic automation | **Conversational interface** |
| Exact Online | Complex UI, no NLP | **Plain Dutch commands** |
| Human bookkeeper | €50-80/hr, slow | **€150-250/mo, instant** |
| Copilot (MS) | English-only, enterprise | **Dutch SMB focus** |

## Success Metrics

- **Time saved**: 5-8 hours/month on invoicing + expenses
- **Error rate**: <2% (auto-categorization accuracy)
- **Overdue invoices**: 40% reduction (auto-reminders)
- **VAT filing time**: 2 hours → 15 minutes

## Roadmap

- **Q2 2026**: Twinfield integration
- **Q3 2026**: Payroll prep (UWV, pension)
- **Q4 2026**: Multi-currency (EU clients)
- **Q1 2027**: AI-powered anomaly detection ("Unusual expense pattern")

## Marketing Positioning

**Headline**: "Van bonnetje naar boekhouding in 30 seconden"
**From receipt to bookkeeping in 30 seconds**

**Value prop**:
- **For ZZP'ers**: Stop losing receipts. WhatsApp foto = klaar.
- **For SMB owners**: Real-time financieel overzicht zonder boekhouder te bellen.
- **For accountants**: 10 clients beheren in de tijd van 1.

**Trust signals**:
- Partner logos: Exact, Moneybird, ING
- "7 jaar retentie, GDPR-compliant"
- Testimonial: "Ik bespaar 10 uur per maand" — Pieter, ZZP Adviseur

## Next Steps

1. **Build Exact Online demo** (sandbox environment)
2. **Create invoice template gallery** (5 Dutch industry standards)
3. **Write case study**: Accountant managing 50 clients
4. **Design expense capture flow** (WhatsApp UX)
