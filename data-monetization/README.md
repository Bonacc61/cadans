# Cadans Data Monetization System

**Purpose:** GDPR-compliant data accretion system for building acquisition value
**Status:** Development
**Target:** €2-5M acquisition value through anonymized pattern libraries

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                 Data Monetization Layer              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │  Tier Management                        │       │
│  ├─────────────────────────────────────────┤       │
│  │  • User tier selection (Shared/Private) │       │
│  │  • Consent mechanism (GDPR compliant)   │       │
│  │  • Tier switching (upgrade/downgrade)   │       │
│  └─────────────────────────────────────────┘       │
│                       │                             │
│                       ▼                             │
│  ┌─────────────────────────────────────────┐       │
│  │  Anonymization Pipeline                 │       │
│  ├─────────────────────────────────────────┤       │
│  │  • PII detection (Dutch patterns)       │       │
│  │  • Faker.js replacement                 │       │
│  │  • Hash-based de-identification         │       │
│  │  • Audit logging                        │       │
│  └─────────────────────────────────────────┘       │
│                       │                             │
│      ┌────────────────┴────────────────┐            │
│      ▼                                 ▼            │
│  ┌──────────────┐              ┌──────────────┐    │
│  │ User-Scoped  │              │    Global    │    │
│  │ ReasoningBank│              │ ReasoningBank│    │
│  ├──────────────┤              ├──────────────┤    │
│  │ • Private    │              │ • Shared     │    │
│  │ • Isolated   │              │ • Anonymized │    │
│  │ • Full data  │              │ • Sellable   │    │
│  └──────────────┘              └──────────────┘    │
│                                        │            │
│                                        ▼            │
│                              ┌──────────────┐      │
│                              │ Acquisition  │      │
│                              │   Metrics    │      │
│                              ├──────────────┤      │
│                              │ • Pattern    │      │
│                              │   count      │      │
│                              │ • Quality    │      │
│                              │   scores     │      │
│                              │ • Coverage   │      │
│                              └──────────────┘      │
└─────────────────────────────────────────────────────┘
```

---

## Components

### 1. Tier Management (`tier-manager.ts`)
- User tier configuration (Shared vs Private)
- Consent tracking and management
- Tier upgrade/downgrade logic
- Billing integration hooks

### 2. Anonymization Pipeline (`anonymization/`)
- PII detection for Dutch data
- Synthetic replacement (Faker.js)
- Hash-based de-identification
- Audit trail logging

### 3. Global ReasoningBank (`global-reasoning-bank.ts`)
- Aggregated pattern storage (Shared tier only)
- k-Anonymity enforcement (k≥5)
- Differential privacy (Laplacian noise)
- Pattern quality scoring

### 4. Acquisition Metrics (`metrics-tracker.ts`)
- Pattern accretion rate tracking
- Quality score monitoring
- Market coverage analysis
- Export for due diligence

### 5. Pattern Export API (`export-api.ts`)
- JSON export for licensing deals
- API access for real-time queries
- Rate limiting and access control

---

## Data Flow

```
User Action (e.g., Olorin scores candidate)
    │
    ▼
[Anonymization Pipeline]
    │
    ├─► User-Scoped ReasoningBank (always)
    │
    └─► Global ReasoningBank (if Shared tier + consent)
            │
            ├─► k-Anonymity check (≥5 similar users)
            ├─► Differential privacy (add noise)
            └─► Pattern storage
                    │
                    ▼
                [Acquisition Metrics]
                    │
                    ▼
                [Export API] → Anthropic, OpenAI, etc.
```

---

## Pricing Tiers

| Feature | Shared (€49/mo) | Private (€99/mo) | Enterprise (€499/mo) |
|---------|-----------------|------------------|----------------------|
| **NanoClaw Agent** | ✅ | ✅ | ✅ |
| **Pattern Learning** | ✅ | ✅ | ✅ |
| **Global Pattern Access** | ✅ | ❌ | ❌ |
| **Data Contribution** | ✅ (opt-in) | ❌ | ❌ |
| **Dedicated VPS** | ❌ | ❌ | ✅ |
| **Custom DPA** | ❌ | ❌ | ✅ |
| **SLA** | Best-effort | 99% | 99.9% |

---

## GDPR Compliance

### Legal Basis

**Shared Tier:** GDPR Article 6(1)(a) - Consent
- Users explicitly opt-in to pattern contribution
- Can withdraw consent and switch to Private tier
- Consent is granular (can opt out of specific pattern types)

**Private Tier:** GDPR Article 6(1)(b) - Contract
- Data processing necessary to provide service
- No secondary use (no pattern contribution)

### Anonymization Standards

- **Method:** Irreversible anonymization (not pseudonymization)
- **Standard:** k-Anonymity (k≥5) per GDPR Article 29 Working Party
- **Audit:** Quarterly review of anonymization effectiveness
- **Documentation:** Technical spec for lawyer review

### Data Subject Rights

- ✅ Right of access (export user data)
- ✅ Right to erasure (delete account + patterns)
- ✅ Right to data portability (JSON export)
- ✅ Right to object (switch to Private tier)
- ✅ Right to withdraw consent (immediate tier change)

---

## AI Act Compliance

### Classification
- **System Type:** High-risk AI (employment/recruitment - Annex III, Section 4(a))
- **Requirements:** Risk management, data governance, transparency, human oversight

### Risk Mitigation
- **Bias:** Anonymize names, gender, age → prevent discrimination
- **Accuracy:** Track success rates, monitor drift
- **Transparency:** Disclose AI involvement to candidates
- **Human Oversight:** Recruiter makes final decision (AI recommends only)

---

## Acquisition Metrics

### Volume Metrics
```typescript
{
  total_anonymized_cycles: 127_483,      // Total hiring cycles processed
  total_learned_patterns: 8_742,         // Unique patterns in global bank
  unique_workflows_captured: 234,        // Distinct workflow types
  users_contributing: 247,               // Shared tier users
  data_points_per_day: 1_234,            // Daily pattern accretion rate
}
```

### Quality Metrics
```typescript
{
  pattern_success_rate: 0.84,            // Avg success rate of patterns
  customer_retention: 0.91,              // Monthly retention rate
  ai_accuracy_improvement: 0.23,         // 23% better than baseline
  pattern_quality_avg: 0.78,             // Avg quality score (0-1)
}
```

### Market Metrics
```typescript
{
  dutch_market_coverage: 0.37,           // 37% of NL freelance tech market
  sector_breakdown: {
    tech: 0.68,                          // 68% tech sector
    creative: 0.22,                      // 22% creative
    consulting: 0.10,                    // 10% consulting
  },
  geographic_coverage: {
    'Amsterdam': 0.42,
    'Rotterdam': 0.23,
    'Utrecht': 0.18,
    'Other': 0.17,
  },
}
```

---

## Export Formats

### 1. Pattern Library Export (JSON)
```json
{
  "export_date": "2026-03-24T00:00:00Z",
  "version": "1.0",
  "pattern_count": 8742,
  "patterns": [
    {
      "id": "pat_nl_recruiting_001",
      "strategy": "Dutch tech recruiting: prioritize soft skills in initial screen",
      "domain": "recruiting",
      "market": "NL_tech_freelance",
      "success_rate": 0.87,
      "usage_count": 2847,
      "quality_score": 0.92,
      "metadata": {
        "sector": "tech",
        "created_from": "2847 anonymized cycles",
        "last_updated": "2026-03-15T12:00:00Z"
      }
    }
  ]
}
```

### 2. Workflow Ontology Export (Markdown)
```markdown
# Dutch Freelance Recruiting Workflows

## Initial Outreach
- **LinkedIn Approach:** Direct message with project details (62% response rate)
- **Email Template:** Dutch directness, 3-sentence max (54% response rate)
- **Timing:** Avoid July-August (vacation), December (holidays)

## Technical Assessment
- **Skills Prioritization:** Backend > Frontend (NL market preference)
- **Interview Structure:** 1hr technical + 30min culture fit
- **Red Flags:** Job-hopping >3 jobs/year (uncommon in NL)

## Contract Negotiation
- **Rate Benchmarks:** €80-150/hr by seniority (NL market rates 2026)
- **Payment Terms:** 30-day standard, 14-day for premium clients
- **Legal Requirements:** ZZP status verification, Dutch tax compliance
```

### 3. Acquisition Metrics Dashboard (CSV)
```csv
date,total_patterns,quality_avg,users_contributing,daily_accretion
2026-01-01,1247,0.72,47,89
2026-02-01,2583,0.75,94,124
2026-03-01,4129,0.78,168,187
```

---

## API Endpoints (Future)

### Pattern Query API
```bash
POST /api/v1/patterns/query
Authorization: Bearer <api_key>
Content-Type: application/json

{
  "query": "Dutch tech recruiting strategies",
  "domain": "recruiting",
  "market": "NL",
  "top_k": 10
}

Response:
{
  "patterns": [...],
  "search_time_ms": 2.3,
  "similarity_scores": [0.92, 0.87, ...]
}
```

### Metrics API
```bash
GET /api/v1/metrics
Authorization: Bearer <api_key>

Response:
{
  "volume": {...},
  "quality": {...},
  "market": {...}
}
```

---

## Development Roadmap

### Phase 1: Core Infrastructure (Weeks 1-2)
- [ ] Tier management system
- [ ] Consent mechanism
- [ ] User-scoped ReasoningBank integration
- [ ] Basic anonymization pipeline

### Phase 2: Global Pattern Pool (Weeks 3-4)
- [ ] Global ReasoningBank implementation
- [ ] k-Anonymity enforcement
- [ ] Differential privacy layer
- [ ] Pattern quality scoring

### Phase 3: Metrics & Export (Weeks 5-6)
- [ ] Acquisition metrics tracking
- [ ] JSON export functionality
- [ ] Workflow ontology generation
- [ ] Dashboard for metrics visualization

### Phase 4: API & Licensing (Weeks 7-8)
- [ ] Pattern query API
- [ ] Rate limiting and access control
- [ ] API documentation
- [ ] First licensing deal (target: Anthropic)

---

## Testing Strategy

### Unit Tests
- Tier switching logic
- Anonymization pipeline (no PII leakage)
- k-Anonymity enforcement
- Pattern quality calculation

### Integration Tests
- End-to-end pattern contribution flow
- Consent withdrawal (tier downgrade)
- Pattern export (JSON, CSV, Markdown)

### Compliance Tests
- GDPR data subject rights (access, erasure, portability)
- AI Act transparency (user notification)
- Anonymization effectiveness (re-identification attempts)

---

## Security Considerations

### Data Protection
- Encryption at rest (PostgreSQL: pgcrypto)
- Encryption in transit (TLS 1.3)
- Access control (role-based permissions)

### Anonymization Security
- No reversible transformations (one-way only)
- Hash functions without salt (for consistency, not security)
- Regular audit of pattern content (no PII leakage)

### API Security
- API key authentication
- Rate limiting (100 req/min)
- IP whitelisting for licensing partners

---

## Success Metrics

### 6 Months
- 100 Shared tier users
- 10,000+ anonymized patterns
- 0.75+ avg quality score
- 0 GDPR violations

### 12 Months
- 500 Shared tier users
- 50,000+ anonymized patterns
- 0.80+ avg quality score
- First licensing deal (€100k)

### 24 Months (Exit Target)
- 2,000 Shared tier users
- 100,000+ anonymized patterns
- 0.85+ avg quality score
- €500k ARR + €2-5M acquisition

---

## References

- [Data Monetization Strategy](/root/cadans/strategy-and-compliance/DATA-MONETIZATION-STRATEGY.md)
- [Compliance Checklist](/root/cadans/strategy-and-compliance/COMPLIANCE_CHECKLIST.md)
- [Ruflo Integration POC](/root/NanoClaw/docs/RUFLO-INTEGRATION-POC.md)
- [Session Log](/root/cadans/logs/SESSION-2026-03-24-ruflo-integration-and-strategy.md)
