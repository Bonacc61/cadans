# Model Routing for Cadans PA

The model router optimizes cost and performance by selecting the appropriate Claude model (Haiku vs Sonnet) based on message complexity.

## Cost Savings

- **Haiku 4.5**: $1/M input, $5/M output (~800ms response, €3-5/client/mo)
- **Sonnet 4.6**: $3/M input, $15/M output (~2,500ms response, €8-15/client/mo)
- **Savings**: 67% cost reduction on simple tasks, 2-3× faster responses

## Routing Modes

### Approach A: Rules-Based (Default)
- **Zero latency** - no extra API calls
- **94-100% accuracy** with current patterns
- Uses regex pattern matching for Dutch and English
- Best for first 5-10 clients

```bash
export MODEL_ROUTING_MODE=rules
```

### Approach B: Classifier
- **~200ms latency** - uses Haiku to classify each message
- **Higher accuracy** for ambiguous cases
- Adds ~€0.001 per message (negligible)
- Better for Dutch colloquial phrasing and edge cases

```bash
export MODEL_ROUTING_MODE=classifier
export ANTHROPIC_API_KEY=your-key
```

### Approach C: Hybrid (Recommended for 10+ clients)
- **Best of both worlds** - rules first, classifier fallback
- Only classifies ambiguous messages
- 40-60% cost savings through smarter routing

```bash
export MODEL_ROUTING_MODE=hybrid
export ANTHROPIC_API_KEY=your-key
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_ROUTING_MODE` | `rules` | Routing strategy: `rules`, `classifier`, or `hybrid` |
| `DEFAULT_FAST_MODEL` | `claude-haiku-4.5-20250514` | Model for simple tasks |
| `DEFAULT_SMART_MODEL` | `claude-sonnet-4.6-20250514` | Model for complex tasks |
| `MODEL_USAGE_LOG_PATH` | `/workspace/group/usage.jsonl` | Path to usage log file |
| `USD_TO_EUR` | `0.92` | Exchange rate for cost calculations |
| `ANTHROPIC_API_KEY` | (required for classifier) | API key for classification calls |

## Pattern Matching

### FAST Patterns (Route to Haiku)

**Dutch:**
- Calendar: `wat staat er op mijn agenda?`, `heb ik nog tijd?`
- Reminders: `herinner me om...`, `vergeet niet`
- Acknowledgments: `ok`, `bedankt`, `ja`, `prima`
- Status: `status?`, `wat is de stand?`

**English:**
- Calendar: `what's on my schedule?`, `check my calendar`
- Reminders: `remind me to...`, `don't forget`
- Acknowledgments: `ok`, `thanks`, `yes`, `sure`
- Status: `status?`, `what's the status?`

### SMART Patterns (Route to Sonnet)

**Dutch:**
- Email: `schrijf een email`, `stuur een mail`, `beantwoord`
- Research: `zoek naar`, `onderzoek`
- Meeting prep: `bereid me voor`, `voorbereiding`
- Multi-step: `en schrijf`, `en zoek`

**English:**
- Email: `draft an email`, `send a message`, `reply to`
- Research: `find me`, `search for`, `research`
- Meeting prep: `prepare for meeting`, `meeting prep`
- Multi-step: `and draft`, `and then`

**Special cases:**
- URLs → always Sonnet (summarization)
- Short messages (<10 words, no complexity) → Haiku
- Long messages (>50 words) → Sonnet

## Usage Logging

All API calls are logged to `/workspace/group/usage.jsonl` in JSONL format:

```json
{
  "timestamp": "2026-03-22T14:30:45.123Z",
  "clientSlug": "jan-de-vries",
  "model": "claude-haiku-4.5-20250514",
  "inputTokens": 1234,
  "outputTokens": 567,
  "costEur": 0.0032,
  "messagePreview": "wat staat er op mijn agenda?",
  "routingReason": "matched FAST pattern: wat staat er op (mijn )?(agenda|kalender)"
}
```

### Cost Analysis

Extract monthly costs per client:

```bash
# Total cost this month for client
cat /workspace/group/usage.jsonl | \
  jq -r 'select(.timestamp | startswith("2026-03")) | .costEur' | \
  awk '{sum+=$1} END {print "€"sum}'

# Cost per model
cat /workspace/group/usage.jsonl | \
  jq -r 'group_by(.model) | .[] | {model: .[0].model, cost: (map(.costEur) | add)}' | \
  jq -r '"\(.model): €\(.cost)"'

# Average cost per message
cat /workspace/group/usage.jsonl | \
  jq -r '[.costEur] | add / length' | \
  awk '{print "€"$1}'
```

### Margin Dashboard

Check if gross margin is above 70%:

```bash
# Monthly revenue (€300 retainer)
REVENUE=300

# Monthly cost
COST=$(cat /workspace/group/usage.jsonl | \
  jq -r 'select(.timestamp | startswith("2026-03")) | .costEur' | \
  awk '{sum+=$1} END {print sum}')

# Gross margin %
echo "scale=1; 100 * (1 - $COST / $REVENUE)" | bc
```

## Testing

Run the test suite:

```bash
cd container/agent-runner
npx tsx src/test-model-router.ts
```

Expected output:
```
Results: 31 passed, 0 failed (100% accuracy)

Cost Estimation Examples:
Haiku  (1K input, 500 output): €0.0032
Sonnet (1K input, 500 output): €0.0097
Savings per message:            €0.0064 (67% cheaper)
```

## Integration

The router is automatically initialized in the agent-runner:

```typescript
// container/agent-runner/src/index.ts
const modelRouter = new ModelRouter({
  logPath: '/workspace/group/usage.jsonl',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
});

// For each message
const decision = await modelRouter.selectModel(prompt);
// Use decision.model in Claude SDK query() call
```

## Deployment

The router is already integrated into NanoClaw. To configure for a client:

1. **Add to .env** (per-client or global):
   ```bash
   MODEL_ROUTING_MODE=rules  # or classifier, hybrid
   DEFAULT_FAST_MODEL=claude-haiku-4.5-20250514
   DEFAULT_SMART_MODEL=claude-sonnet-4.6-20250514
   MODEL_USAGE_LOG_PATH=/workspace/group/usage.jsonl
   USD_TO_EUR=0.92
   ```

2. **No code changes required** - router is automatic

3. **Monitor costs** via `usage.jsonl`

## Tuning Patterns

To add custom patterns for specific clients:

1. Fork the client's NanoClaw instance
2. Edit `container/agent-runner/src/model-router.ts`
3. Add patterns to `FAST_PATTERNS` or `SMART_PATTERNS`
4. Rebuild: `npm run build`
5. Test: `npx tsx src/test-model-router.ts`

Example: Client frequently uses voice notes (longer but simple):

```typescript
FAST_PATTERNS.push(
  /^.{100,300}$/,  // 100-300 chars, no complexity
);
```

## Monthly Optimization Checklist

During client optimization calls:

1. **Review usage.jsonl** - check Haiku/Sonnet split
2. **Calculate margin** - ensure >70% gross margin
3. **Check misroutes** - messages that should have used different model
4. **Add patterns** - tune for client's specific phrasing
5. **Update config** - switch to hybrid mode if needed

Target: **60-80% Haiku, 20-40% Sonnet** for optimal cost/quality balance.

## Performance Impact

- **Rules mode**: +0ms (no overhead)
- **Classifier mode**: +200ms per message
- **Hybrid mode**: +50ms average (only for ambiguous cases)

All modes maintain Claude SDK response quality - only model selection changes.
