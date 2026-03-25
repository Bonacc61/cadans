# Cadans GDPR/AI Act Compliance Checklist

**Status:** Pre-Launch Self-Assessment
**Last Updated:** 2026-03-24
**Review Frequency:** Weekly during development, Monthly post-launch

---

## ✅ GDPR Compliance (Regulation (EU) 2016/679)

### Article 5: Principles

- [ ] **Lawfulness, fairness, transparency**
  - [ ] Legal basis documented (consent, contract, legitimate interest)
  - [ ] Privacy policy published and accessible
  - [ ] Users informed about AI-assisted decisions

- [ ] **Purpose limitation**
  - [ ] Data used only for stated purpose (recruitment/freelance management)
  - [ ] No secondary use without consent

- [ ] **Data minimization**
  - [ ] Collect only necessary PII
  - [ ] Anonymize immediately after collection
  - [ ] Delete raw PII within 30 days

- [ ] **Accuracy**
  - [ ] Users can review/correct their data
  - [ ] Anonymization preserves accuracy (no information loss that affects decisions)

- [ ] **Storage limitation**
  - [ ] Retention policy documented (see DATA-MONETIZATION-STRATEGY.md)
  - [ ] Automated deletion after retention period

- [ ] **Integrity and confidentiality**
  - [ ] Encryption at rest (database)
  - [ ] Encryption in transit (HTTPS, TLS for Claude API)
  - [ ] Access controls (who can see raw vs anonymized data)

- [ ] **Accountability**
  - [ ] DPIA completed (pending - build first)
  - [ ] Records of processing activities maintained
  - [ ] DPO appointed (or exemption documented)

### Article 6: Lawfulness of Processing

- [ ] **Legal basis selected:**
  - [ ] Option A: Consent (GDPR 6(1)(a)) - for pattern contribution
  - [ ] Option B: Contract (GDPR 6(1)(b)) - for providing service
  - [ ] Option C: Legitimate interest (GDPR 6(1)(f)) - for service improvement

- [ ] **Consent requirements (if using 6(1)(a)):**
  - [ ] Freely given (not bundled with service)
  - [ ] Specific (separate consent for pattern sharing)
  - [ ] Informed (clear explanation of anonymization)
  - [ ] Unambiguous (opt-in, not pre-checked box)
  - [ ] Withdrawable (can revoke and switch to Private Mode)

### Article 13-14: Information to Data Subjects

- [ ] **Privacy policy includes:**
  - [ ] Identity of data controller (Cadans B.V.)
  - [ ] Contact details of DPO (or representative)
  - [ ] Purposes of processing
  - [ ] Legal basis for processing
  - [ ] Recipients of data (Anthropic Claude API)
  - [ ] Data retention periods
  - [ ] Rights (access, rectification, erasure, portability, objection)
  - [ ] Right to lodge complaint with Dutch DPA (Autoriteit Persoonsgegevens)

### Article 15-22: Data Subject Rights

- [ ] **Right of access** - Users can download their data
- [ ] **Right to rectification** - Users can edit their profile
- [ ] **Right to erasure ("right to be forgotten")** - Delete account function
- [ ] **Right to restriction of processing** - Pause AI processing
- [ ] **Right to data portability** - Export in machine-readable format (JSON)
- [ ] **Right to object** - Opt-out of automated decision-making
- [ ] **Rights related to automated decision-making** - Human-in-the-loop for high-stakes decisions

### Article 28: Data Processing Agreements

- [ ] **DPA with Anthropic** (for Claude API)
  - [ ] Terms reviewed (Anthropic's DPA covers EU data transfers)
  - [ ] Confirmed: Anthropic doesn't train on user data
  - [ ] Standard Contractual Clauses (SCCs) in place for US transfer

- [ ] **DPA with infrastructure providers**
  - [ ] Hetzner/OVH (if EU-based, lower risk)
  - [ ] PostgreSQL hosting provider
  - [ ] Backup storage provider

### Article 32: Security of Processing

- [ ] **Technical measures:**
  - [ ] Database encryption (PostgreSQL: pgcrypto or LUKS)
  - [ ] API encryption (HTTPS only, TLS 1.3)
  - [ ] Password hashing (bcrypt, Argon2)
  - [ ] Secure key management (not hardcoded)

- [ ] **Organizational measures:**
  - [ ] Access control policy (who can access what)
  - [ ] Employee training (GDPR awareness)
  - [ ] Incident response plan (data breach notification within 72 hours)

### Article 33-34: Data Breach Notification

- [ ] **Process documented:**
  - [ ] Internal detection mechanism (logging, monitoring)
  - [ ] Notification to Dutch DPA within 72 hours
  - [ ] Notification to affected users (if high risk)
  - [ ] Breach register maintained

### Article 35: Data Protection Impact Assessment (DPIA)

- [ ] **DPIA required?** YES (high-risk AI system for recruitment)
- [ ] **DPIA template selected** (ICO or CNIL template)
- [ ] **DPIA completion:** PENDING (build first, then document)

### Article 37: Data Protection Officer (DPO)

- [ ] **DPO required?** Check:
  - [ ] Public authority? NO
  - [ ] Core activities involve large-scale systematic monitoring? MAYBE (depends on scale)
  - [ ] Core activities involve large-scale processing of sensitive data? NO (anonymized)

- [ ] **DPO appointed:** NOT YET (required if >250 employees OR high-risk processing at scale)
- [ ] **Exemption documented:** Small business exemption (initially)

---

## ✅ EU AI Act Compliance (Regulation (EU) 2024/1689)

### Article 6: Classification (High-Risk AI System)

- [ ] **Is Cadans a high-risk AI system?** YES
  - Annex III, Section 4(a): AI for recruitment and employment decisions

- [ ] **Risk classification documented** in AI Act compliance file

### Article 9: Risk Management System

- [ ] **Risk management process established:**
  - [ ] Identify known/foreseeable risks (bias, discrimination, errors)
  - [ ] Estimate and evaluate risks
  - [ ] Adopt risk mitigation measures (anonymization, human oversight)
  - [ ] Test and validate system
  - [ ] Monitor performance post-deployment

- [ ] **Documented risks:**
  - [ ] Risk: Bias against non-Dutch names → Mitigation: Anonymize names
  - [ ] Risk: Gender bias → Mitigation: Remove gender indicators
  - [ ] Risk: Age discrimination → Mitigation: Remove birthdates
  - [ ] Risk: Claude hallucinations → Mitigation: Human review before final decision

### Article 10: Data Governance

- [ ] **Training data quality:**
  - [ ] Relevant, representative, error-free (using anonymized historical data)
  - [ ] Free from bias (tested on diverse candidate pool)
  - [ ] Appropriate statistical properties (documented success rate metrics)

- [ ] **Data governance practices:**
  - [ ] Data lineage tracked (where patterns came from)
  - [ ] Data quality monitoring (detect data drift)
  - [ ] Bias testing (periodic audits)

### Article 13: Transparency and Provision of Information to Users

- [ ] **Users informed:**
  - [ ] "This system uses AI to assist in candidate evaluation"
  - [ ] "AI provides recommendations; final decision is made by humans"
  - [ ] "You have the right to object to automated decision-making"

- [ ] **Documentation published:**
  - [ ] AI system capabilities and limitations
  - [ ] Accuracy metrics (if available)
  - [ ] Instructions for use (for recruiters using Cadans)

### Article 14: Human Oversight

- [ ] **Human-in-the-loop design:**
  - [ ] AI provides scores/recommendations only
  - [ ] Recruiter makes final hiring decision
  - [ ] Override mechanism (recruiter can disagree with AI)
  - [ ] Audit log (who made what decision)

- [ ] **Oversight measures:**
  - [ ] Users can pause/stop AI processing
  - [ ] Users notified of AI involvement
  - [ ] Appeal mechanism for candidates

### Article 15: Accuracy, Robustness, Cybersecurity

- [ ] **Accuracy:**
  - [ ] Success rate measured and documented
  - [ ] False positive/negative rates monitored
  - [ ] Regular testing with new data

- [ ] **Robustness:**
  - [ ] Handle edge cases (e.g., resumes in multiple languages)
  - [ ] Graceful degradation (if Claude API down, system still usable)
  - [ ] Error handling (log failures, alert users)

- [ ] **Cybersecurity:**
  - [ ] Secure against adversarial attacks (e.g., resume stuffed with keywords)
  - [ ] Input validation (prevent injection attacks)
  - [ ] Regular security audits

### Article 16: Obligations of Providers (Cadans as provider)

- [ ] **Quality management system:**
  - [ ] Compliance monitoring strategy
  - [ ] Post-market monitoring (track performance after launch)
  - [ ] Incident reporting (serious incidents to authorities)

- [ ] **Technical documentation:**
  - [ ] System architecture diagram
  - [ ] Data flow diagram
  - [ ] Anonymization algorithm specification
  - [ ] Validation/testing results

### Article 17: Quality Management System

- [ ] **QMS elements:**
  - [ ] Compliance policy
  - [ ] Design and development procedures
  - [ ] Testing and validation procedures
  - [ ] Post-market monitoring procedures
  - [ ] Incident management procedures

### Article 49: Codes of Conduct (Optional)

- [ ] **Industry codes adopted?** (e.g., HR tech ethics code)
- [ ] **Internal ethics guidelines** (how we use AI responsibly)

### Article 52: Transparency Obligations

- [ ] **Users notified when interacting with AI:**
  - [ ] Candidates know AI scores resumes
  - [ ] Recruiters know AI provides recommendations
  - [ ] Clear labeling in UI ("AI-assisted scoring")

### Article 71: Post-Market Monitoring

- [ ] **Monitoring plan:**
  - [ ] Collect user feedback
  - [ ] Track accuracy metrics over time
  - [ ] Detect performance degradation
  - [ ] Report serious incidents to authorities

---

## ✅ Dutch National Law

### UAVG (Dutch GDPR Implementation Act)

- [ ] **Register with Autoriteit Persoonsgegevens (Dutch DPA)?**
  - Not required unless >250 employees OR high-risk processing at large scale

- [ ] **DPO contact published?** (if applicable)

### Dutch Data Breach Notification

- [ ] **72-hour notification process** to AP (Autoriteit Persoonsgegevens)
- [ ] **Contact:** datalek@autoriteitpersoonsgegevens.nl

---

## ✅ Commercial/Contractual

### Terms of Service

- [ ] **TOS drafted:**
  - [ ] Service description
  - [ ] Pricing and payment terms
  - [ ] User obligations
  - [ ] Limitation of liability
  - [ ] Termination conditions
  - [ ] Dispute resolution (Dutch law, Netherlands jurisdiction)

### Privacy Policy

- [ ] **Privacy policy drafted** (GDPR Articles 13-14 compliant)
- [ ] **Last updated:** YYYY-MM-DD
- [ ] **Published at:** https://cadans.nl/privacy

### Data Processing Agreements (for Tier 2 customers)

- [ ] **DPA template** for enterprise customers
- [ ] **Sub-processor list** (Anthropic, hosting providers)

### Cookie Policy (if applicable)

- [ ] **Cookie banner** (if using analytics)
- [ ] **Consent mechanism** (GDPR-compliant, not implied consent)

---

## 🔄 Ongoing Compliance (Post-Launch)

### Monthly

- [ ] Review user data access logs
- [ ] Check for anomalous anonymization failures
- [ ] Monitor Claude API usage for PII leakage

### Quarterly

- [ ] Audit anonymization accuracy (sample 100 records)
- [ ] Review data retention (delete expired data)
- [ ] Update DPIA if system changes
- [ ] Review DPAs with vendors

### Annually

- [ ] Full GDPR audit (internal or external)
- [ ] AI Act conformity self-assessment
- [ ] Update privacy policy/TOS if needed
- [ ] Review and renew insurance (cyber liability, E&O)

---

## 📞 When to Engage Lawyer

**Triggers for legal review:**

1. **Before public launch** (€2-5k for GDPR review)
   - Review DPA, privacy policy, TOS
   - Validate anonymization approach
   - Confirm DPIA completeness

2. **Before first enterprise customer** (€1-3k)
   - Draft custom DPA for Tier 2
   - Review liability clauses

3. **If data breach occurs** (IMMEDIATE - €3-10k)
   - Breach notification assistance
   - Communication strategy

4. **Before acquisition negotiations** (€5-15k)
   - Due diligence preparation
   - Rep & warranty review

5. **If AP (Dutch DPA) initiates investigation** (€10-50k)
   - Regulatory defense
   - Compliance remediation

---

## 📚 Resources

- **Dutch DPA (AP):** https://autoriteitpersoonsgegevens.nl/en
- **GDPR Full Text:** https://gdpr.eu/
- **AI Act Full Text:** https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- **ICO DPIA Template:** https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/data-protection-impact-assessments-dpias/
- **CNIL (French DPA) AI Resources:** https://www.cnil.fr/en/artificial-intelligence

---

**Status Summary:**
- ✅ Compliant: 0/87 items
- 🚧 In Progress: 0/87 items
- ❌ Not Started: 87/87 items
- 📅 Next Review: After Olorin MVP is functional

**Note:** This is a working checklist. Update weekly during development. Schedule lawyer review once system is built and tested in production.
