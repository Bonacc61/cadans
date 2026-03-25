# Example: Deploying Cadans PA with Model Routing

This example shows how to deploy a Cadans PA client with the model router configured for cost optimization.

## Client: Jan de Vries (Consultancy)

**Profile:**
- MKB owner, 4-person consultancy
- 40+ emails/day, heavy calendar use
- Budget: €250/month retainer
- Target margin: 75%+

## 1. Discovery Call (Day 1)

Fill out `client-config.yaml`:

```yaml
client:
  name: "Jan de Vries"
  first_name: "Jan"
  company: "De Vries Consultancy B.V."
  kvk_number: "12345678"
  industry: "management-consulting"
  team_size: 4

assistant:
  name: "Assistent"
  tone: "professional-warm"
  language: "nl"
  writing_style: "direct-kort"

schedule:
  work_hours: "08:00-18:00"
  timezone: "Europe/Amsterdam"
  focus_blocks: "Tue,Thu 09:00-12:00"
  meeting_preferences: "prefers morning meetings for external"
  default_meeting_duration: 30
  default_location: "Google Meet"
  buffer_minutes: 15

email:
  provider: "gmail"
  address: "jan@devriesadvies.nl"
  digest_time: "07:30"
  signoff: |
    Met vriendelijke groet,
    Jan de Vries
    De Vries Consultancy B.V.
  action_senders:
    - "*@client-company.nl"
    - "lisa@partnerfirm.com"
  skip_senders:
    - "*@newsletter.linkedin.com"
    - "*@marketing.*"

contacts:
  - name: "Lisa van Dam"
    company: "Partner Firm"
    role: "Senior Consultant"
    relationship: "partner"
    email: "lisa@partnerfirm.com"
    preference: "email"
    notes: "Responds within 2 hours, prefers formal Dutch"

  - name: "BuildCo Client"
    company: "BuildCo Nederland"
    role: "Project Manager"
    relationship: "client"
    email: "pm@buildco.nl"
    preference: "whatsapp"
    notes: "Always late to meetings, send reminder 30 min before"

container:
  memory_limit: "1g"
  cpu_limit: "1.0"
  restart_policy: "unless-stopped"
  whatsapp_number: "+31612345678"
  allowed_senders:
    - "+31612345678"  # Jan's mobile
    - "+31687654321"  # Jan's work phone
```

## 2. Deploy (Day 2)

Run the deployment script:

```bash
./deploy.sh /opt/cadans/configs/jan-de-vries.yaml
```

This generates:
- `/opt/cadans/clients/jan-de-vries/data/CLAUDE.md` (persona)
- `/opt/cadans/clients/jan-de-vries/config/.env` (environment)
- `/opt/cadans/clients/jan-de-vries/config/docker-compose.yml`
- `/opt/cadans/clients/jan-de-vries/nanoclaw/` (framework clone)

## 3. Configure Model Routing

Edit `/opt/cadans/clients/jan-de-vries/config/.env`:

```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-api03-...

# Model routing (cost optimization)
MODEL_ROUTING_MODE=rules
DEFAULT_FAST_MODEL=claude-haiku-4.5-20250514
DEFAULT_SMART_MODEL=claude-sonnet-4.6-20250514
MODEL_USAGE_LOG_PATH=/workspace/group/usage.jsonl
USD_TO_EUR=0.92

# WhatsApp
WHATSAPP_NUMBER=+31612345678
WHATSAPP_ALLOWED_SENDERS=+31612345678,+31687654321

# Container settings
CONTAINER_MEMORY_LIMIT=1g
CONTAINER_CPU_LIMIT=1.0
```

## 4. Start Container

```bash
cd /opt/cadans/clients/jan-de-vries/config
docker-compose up -d
```

## 5. Monitor Costs (Monthly)

After 30 days of usage, check the cost breakdown:

```bash
# Total cost this month
cat /opt/cadans/clients/jan-de-vries/data/usage.jsonl | \
  jq -r 'select(.timestamp | startswith("2026-04")) | .costEur' | \
  awk '{sum+=$1} END {printf "€%.2f\n", sum}'
```

**Expected monthly costs for Jan:**
- VPS (1/3 of CX22): €1.50
- WhatsApp Business: €20.00
- Claude API (Haiku 60%, Sonnet 40%): €35.00
- **Total COGS: €56.50**
- Revenue: €250.00
- **Gross margin: 77.4%** ✓

## 6. Cost Breakdown by Model

```bash
cat /opt/cadans/clients/jan-de-vries/data/usage.jsonl | \
  jq -r 'group_by(.model) | .[] | {
    model: .[0].model,
    count: length,
    total_cost: (map(.costEur) | add),
    avg_cost: (map(.costEur) | add / length)
  }' | jq -r '
    "Model: \(.model | split("-")[1])",
    "  Messages: \(.count)",
    "  Total cost: €\(.total_cost | . * 100 | round / 100)",
    "  Avg per message: €\(.avg_cost | . * 10000 | round / 10000)",
    ""
  '
```

**Sample output:**
```
Model: haiku
  Messages: 423
  Total cost: €18.45
  Avg per message: €0.0044

Model: sonnet
  Messages: 187
  Total cost: €16.55
  Avg per message: €0.0885
```

## 7. Optimization (Month 2)

During the monthly call, Jan mentions he often sends voice notes that get transcribed. These are long but simple status updates. Add a custom pattern:

```bash
# Edit the router
cd /opt/cadans/clients/jan-de-vries/nanoclaw/container/agent-runner
nano src/model-router.ts
```

Add to `FAST_PATTERNS`:
```typescript
// Voice notes (long but simple updates)
/^.{100,400}$/,  // 100-400 chars, no complexity signals
```

Rebuild and restart:
```bash
npm run build
cd /opt/cadans/clients/jan-de-vries/config
docker-compose restart
```

## 8. Upgrade to Hybrid Mode (Month 4)

After 3 months of data, switch to hybrid routing for better accuracy:

```bash
# Edit .env
nano /opt/cadans/clients/jan-de-vries/config/.env
```

Change:
```bash
MODEL_ROUTING_MODE=hybrid  # was: rules
```

Restart:
```bash
docker-compose restart
```

Expected impact:
- Accuracy: 94% → 98%
- Haiku usage: 60% → 70%
- Monthly API cost: €35 → €28
- New margin: 77.4% → 80.8%

## 9. Vertical Upsell (Month 5)

Jan asks about automating invoice reminders. Deploy Cadans Collect as a sub-agent:

1. Update YAML to include Collect config
2. Re-run `deploy.sh` with `--add-vertical=collect`
3. New monthly revenue: €250 + €200 = €450
4. Added COGS: €12 (Collect agent API usage)
5. New margin: (€450 - €68.50) / €450 = **84.8%**

## Cost Tracking Dashboard

Create a simple script `/opt/cadans/scripts/monthly-report.sh`:

```bash
#!/bin/bash
CLIENT_SLUG=$1
MONTH=$(date +%Y-%m)
USAGE_LOG="/opt/cadans/clients/$CLIENT_SLUG/data/usage.jsonl"

echo "=== Monthly Report: $CLIENT_SLUG ($MONTH) ==="
echo

# Total cost
TOTAL_COST=$(cat $USAGE_LOG | \
  jq -r "select(.timestamp | startswith(\"$MONTH\")) | .costEur" | \
  awk '{sum+=$1} END {printf "%.2f", sum}')

echo "API Cost: €$TOTAL_COST"

# Message count
MSG_COUNT=$(cat $USAGE_LOG | \
  jq -r "select(.timestamp | startswith(\"$MONTH\"))" | wc -l)

echo "Messages: $MSG_COUNT"

# Haiku/Sonnet split
HAIKU_PCT=$(cat $USAGE_LOG | \
  jq -r "select(.timestamp | startswith(\"$MONTH\")) | select(.model | contains(\"haiku\"))" | \
  wc -l | awk -v total=$MSG_COUNT '{printf "%.0f", ($1/total)*100}')

echo "Haiku usage: $HAIKU_PCT%"

# Margin calculation (assume €250 revenue)
REVENUE=250
VPS=1.50
WHATSAPP=20.00
TOTAL_COGS=$(echo "$TOTAL_COST + $VPS + $WHATSAPP" | bc)
MARGIN=$(echo "scale=1; 100 * (1 - $TOTAL_COGS / $REVENUE)" | bc)

echo
echo "Revenue: €$REVENUE"
echo "COGS: €$TOTAL_COGS (API: €$TOTAL_COST, VPS: €$VPS, WhatsApp: €$WHATSAPP)"
echo "Gross Margin: $MARGIN%"

if (( $(echo "$MARGIN < 70" | bc -l) )); then
  echo "⚠️  WARNING: Margin below 70% - review pricing or reduce usage"
fi
```

Usage:
```bash
chmod +x /opt/cadans/scripts/monthly-report.sh
./monthly-report.sh jan-de-vries
```

## Summary

- **Setup time**: 5 days (1 hour/day)
- **Monthly maintenance**: 30 minutes (optimization call)
- **Target margin**: 75%+
- **Actual margin**: 77-85% depending on usage
- **Client satisfaction**: High (saves 2.2 hrs/day = €220 value)
- **ROI for client**: 14.7× monthly return
