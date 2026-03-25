# Custom Skill Template

**Skill Name:** {SKILL_NAME}
**Client:** {CLIENT_NAME}
**Created:** {DATE}

---

## Purpose

{1-2 sentence description of what this skill does}

---

## Use Cases

### Primary Use Case

**Scenario:** {Describe the main business problem}

**User flow:**
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Expected outcome:** {What the user achieves}

---

### Secondary Use Cases (if applicable)

**Scenario 2:** {Additional use case}

---

## Workflow

### Trigger Events

**This skill activates when:**
- {Condition 1}
- {Condition 2}
- {Condition 3}

**Examples:**
- WhatsApp message: "{keyword or pattern}"
- Email received from: {sender pattern}
- Scheduled task: {cron pattern}
- API webhook: {endpoint}

---

### Process Steps

**Step 1: {Action Name}**

**Input:**
- {Data point 1}
- {Data point 2}

**Process:**
{Describe what happens}

**Output:**
- {Result 1}
- {Result 2}

**Error handling:**
- If {error condition} → {fallback action}

---

**Step 2: {Action Name}**

{Repeat for each step}

---

## Integration Points

### API Integrations

**{Platform Name}**

**Endpoints used:**
- `GET /api/v1/{resource}` — {Purpose}
- `POST /api/v1/{resource}` — {Purpose}

**Authentication:** {OAuth 2.0 / API Key / Basic Auth}

**Rate limits:** {Requests per minute/hour}

**Example request:**
```json
{
  "field": "value"
}
```

**Example response:**
```json
{
  "result": "data"
}
```

---

### Data Storage

**SQLite tables:**

**Table: `{table_name}`**
```sql
CREATE TABLE {table_name} (
  id INTEGER PRIMARY KEY,
  client_id TEXT NOT NULL,
  {field_1} TEXT,
  {field_2} INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:** {What this table stores}

---

### File Storage

**Location:** `/opt/cadans/clients/{client-slug}/data/{category}/`

**File naming:** `{YYYY-MM-DD}_{description}.{ext}`

**Retention:** {Duration}

---

## Templates

### WhatsApp Response Template

```
{template_variable_1}

{template_variable_2}

{call_to_action}
```

**Variables:**
- `{template_variable_1}`: {Description}
- `{template_variable_2}`: {Description}

---

### Email Template

```
Onderwerp: {subject}

Beste {recipient_name},

{body}

Met vriendelijke groet,
{sender_name}
```

---

## Configuration Options

**Per-client settings:**

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `{setting_1}` | boolean | true | {What it controls} |
| `{setting_2}` | integer | 10 | {What it controls} |
| `{setting_3}` | string | "nl" | {What it controls} |

**Example config:**
```json
{
  "setting_1": true,
  "setting_2": 15,
  "setting_3": "en"
}
```

---

## Error Handling

### Common Errors

**Error 1: {Error Type}**

**Cause:** {Why it happens}

**User message:** "{User-facing error message}"

**Recovery:**
1. {Recovery step 1}
2. {Recovery step 2}

**Escalation:** {When to alert human}

---

## Performance Metrics

**Track:**
- {Metric 1}: {Target value}
- {Metric 2}: {Target value}
- {Metric 3}: {Target value}

**Report frequency:** Weekly/Monthly

---

## GDPR Compliance

### Data Collected

- **Personal data:** {List what's collected}
- **Purpose:** {Why it's collected}
- **Retention:** {How long it's kept}

### User Rights

- **Access:** {How user can request data}
- **Deletion:** {How user can request deletion}
- **Portability:** {Export format}

---

## Testing Checklist

Before deployment, verify:

- [ ] All API integrations working (test in sandbox)
- [ ] Error handling gracefully degrades
- [ ] User messages are in correct language (NL/EN)
- [ ] GDPR compliance checks pass
- [ ] Performance meets SLA targets
- [ ] Security: No credentials in logs
- [ ] Rate limits respected (no API quota breaches)

---

## Deployment

**Environment:** Production (`/opt/cadans/clients/{client-slug}/`)

**Dependencies:**
- {Dependency 1}
- {Dependency 2}

**Start command:**
```bash
cd /opt/cadans/clients/{client-slug}
npm run start:custom-{skill-name}
```

---

## Support & Maintenance

**Owner:** {Developer name}
**Client contact:** {Client email/phone}
**Support tier:** {Standard/Premium/Enterprise}

**Known issues:**
- {Issue 1}: {Workaround}

**Roadmap:**
- {Enhancement 1}: {ETA}
- {Enhancement 2}: {ETA}

---

## Anti-Patterns

- ❌ Never {anti-pattern 1}
- ❌ Never {anti-pattern 2}
- ❌ Never {anti-pattern 3}

---

## Changelog

**v1.0.0** (2026-03-22)
- Initial release
- {Feature 1}
- {Feature 2}
