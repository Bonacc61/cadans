# MCP Implementation Guide for Cadans

**Quick Start:** Get Calendar MCP Server running in 30 minutes

---

## Prerequisites

```bash
# Install required Python packages
pip install google-api-python-client google-auth google-auth-oauthlib google-auth-httplib2

# OR add to requirements.txt
echo "google-api-python-client>=2.100.0" >> requirements.txt
echo "google-auth>=2.23.0" >> requirements.txt
pip install -r requirements.txt
```

---

## Step 1: Set Up Google Calendar OAuth (5 minutes)

### 1.1 Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Create new project: "Cadans-Calendar-Integration"
3. Enable Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search "Google Calendar API"
   - Click "Enable"

### 1.2 Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: "Desktop app"
4. Name: "Cadans PA Agent"
5. Download JSON credentials → Save as `client_secret.json`

### 1.3 Get Refresh Token

```bash
# Run OAuth flow (one-time setup)
python3 <<EOF
from google_auth_oauthlib.flow import InstalledAppFlow
import json

SCOPES = ['https://www.googleapis.com/auth/calendar']

flow = InstalledAppFlow.from_client_secrets_file(
    'client_secret.json', SCOPES)
creds = flow.run_local_server(port=0)

# Save refresh token
with open('token.json', 'w') as f:
    json.dump({
        'refresh_token': creds.refresh_token,
        'client_id': creds.client_id,
        'client_secret': creds.client_secret
    }, f)

print(f"Refresh token saved to token.json")
print(f"CALENDAR_OAUTH_TOKEN={creds.refresh_token}")
EOF
```

Copy the `CALENDAR_OAUTH_TOKEN` value for next step.

---

## Step 2: Configure MCP Server (5 minutes)

### 2.1 Create Client Config

```bash
# Create client directory
mkdir -p /opt/cadans/clients/test-client/scripts

# Copy MCP registry template
cp /root/cadans/scripts/mcp-registry.template.json \
   /opt/cadans/clients/test-client/scripts/mcp-registry.json
```

### 2.2 Edit Configuration

```bash
# Edit mcp-registry.json
nano /opt/cadans/clients/test-client/scripts/mcp-registry.json
```

Replace placeholders:

```json
{
  "servers": {
    "calendar": {
      "type": "stdio",
      "command": "python3",
      "args": ["/root/cadans/scripts/mcp-servers/calendar_mcp_server.py"],
      "env": {
        "CALENDAR_PROVIDER": "google",
        "OAUTH_REFRESH_TOKEN": "1//0g_YOUR_REFRESH_TOKEN_HERE",
        "CALENDAR_ID": "primary",
        "BUFFER_MINUTES": "15",
        "WORKING_HOURS_START": "09:00",
        "WORKING_HOURS_END": "18:00",
        "TIMEZONE": "Europe/Amsterdam",
        "GOOGLE_CLIENT_ID": "YOUR_CLIENT_ID.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "YOUR_CLIENT_SECRET"
      },
      "description": "Calendar integration (Google Calendar)"
    }
  }
}
```

**Security Note:** Encrypt these tokens in production! See NanoClaw's `credential-proxy.ts` for encryption example.

---

## Step 3: Test MCP Server (5 minutes)

### 3.1 Manual Test

```bash
# Set environment variables
export CALENDAR_PROVIDER=google
export OAUTH_REFRESH_TOKEN="1//0g_YOUR_TOKEN_HERE"
export CALENDAR_ID="primary"
export GOOGLE_CLIENT_ID="YOUR_CLIENT_ID"
export GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET"

# Test server
python3 /root/cadans/scripts/mcp-servers/calendar_mcp_server.py
```

Then send test requests via stdin:

```bash
# Check availability
echo '{"tool": "check_availability", "args": {"date": "2026-03-26", "start_time": "09:00", "end_time": "18:00"}}' | python3 calendar_mcp_server.py

# Expected output:
# {"success": true, "result": {"free_slots": [...], "busy_slots": [...]}}
```

### 3.2 Health Check

```bash
echo '{"tool": "health_check", "args": {}}' | python3 calendar_mcp_server.py

# Expected output:
# {"success": true, "result": {"status": "healthy", "provider": "google", ...}}
```

---

## Step 4: Integrate with Agent (10 minutes)

### 4.1 Update Agent Prompt

**Before (200 lines with hardcoded API logic):**
```markdown
# agents/personal-assistant/CLAUDE.md

## Calendar Management

Use Google Calendar API:
1. Import: `from googleapiclient.discovery import build`
2. Authenticate: `creds = Credentials(...)`
... [150 more lines]
```

**After (50 lines with MCP tools):**
```markdown
# agents/personal-assistant/CLAUDE.md

## Calendar Management

You have access to a `calendar` MCP server with these tools:

### check_availability(date, start_time, end_time)
Returns free and busy time slots.

**Example:**
```json
{
  "tool": "check_availability",
  "args": {
    "date": "2026-03-26",
    "start_time": "09:00",
    "end_time": "18:00"
  }
}

Response:
{
  "free_slots": [
    {"start": "09:00", "end": "10:30"},
    {"start": "11:00", "end": "18:00"}
  ],
  "busy_slots": [
    {"start": "10:30", "end": "11:00", "title": "Team standup"}
  ]
}
```

### create_event(title, start, end, attendees)
Creates a calendar event.

**Example:**
```json
{
  "tool": "create_event",
  "args": {
    "title": "Meeting met Jan de Bakker",
    "start": "2026-03-26T14:00:00",
    "end": "2026-03-26T15:00:00",
    "attendees": ["jan@bakkerij.nl"],
    "location": "Office"
  }
}

Response:
{
  "event_id": "abc123",
  "status": "confirmed",
  "html_link": "https://calendar.google.com/..."
}
```

## Workflow

When a user asks about meeting availability:
1. Extract date/time from request
2. Use `check_availability()` to get free slots
3. If conflicts exist, show busy periods and propose free alternatives
4. After user confirms, use `create_event()` to book
5. Confirm in Dutch: "Afspraak ingepland voor [date] om [time]"

**Note:** The calendar server automatically adds 15-minute buffer time.
```

---

## Step 5: Deploy to NanoClaw (5 minutes)

### 5.1 Copy MCP Server to NanoClaw

```bash
# Copy to NanoClaw container scripts
cp /root/cadans/scripts/mcp-servers/calendar_mcp_server.py \
   /root/NanoClaw/container/agent-runner/scripts/

# Make executable
chmod +x /root/NanoClaw/container/agent-runner/scripts/calendar_mcp_server.py
```

### 5.2 Mount MCP Registry in Container

Edit `/root/NanoClaw/src/container-runner.ts`:

```typescript
// Add MCP registry mount
const mounts = [
  // ... existing mounts
  {
    source: path.join(groupDir, 'scripts', 'mcp-registry.json'),
    target: '/workspace/project/scripts/mcp-registry.json',
    type: 'file'
  }
];
```

### 5.3 Test End-to-End

```bash
# Start NanoClaw
cd /root/NanoClaw
npm run dev

# Send test message to PA agent
# (via WhatsApp or your configured channel)
"Can I schedule a meeting next Tuesday at 2pm?"

# Expected flow:
# 1. Agent receives message
# 2. Agent calls calendar.check_availability(...)
# 3. MCP server queries Google Calendar
# 4. Agent responds with free slots
# 5. User confirms → Agent calls calendar.create_event(...)
```

---

## Troubleshooting

### Error: "OAUTH_REFRESH_TOKEN not set"

**Fix:** Ensure environment variables are set in `mcp-registry.json`:

```json
"env": {
  "OAUTH_REFRESH_TOKEN": "1//0g_YOUR_TOKEN_HERE"
}
```

### Error: "google-api-python-client not installed"

**Fix:** Install in container:

```bash
# Add to container Dockerfile
RUN pip3 install google-api-python-client google-auth
```

### Error: "401 Unauthorized"

**Fix:** Refresh token expired. Re-run OAuth flow (Step 1.3)

### Error: "Calendar not found"

**Fix:** Check `CALENDAR_ID` - use `primary` for default calendar or specific ID for shared calendars

### MCP Server Not Responding

**Debug:** Check logs:

```bash
# Run MCP server manually with debug logging
export PYTHONUNBUFFERED=1
python3 calendar_mcp_server.py 2>&1 | tee mcp-debug.log
```

Look for errors in stderr (logs) vs stdout (MCP protocol)

---

## Next Steps

### 1. Add Email MCP Server

```bash
# Copy email template
cp /root/cadans/scripts/mcp-servers/calendar_mcp_server.py \
   /root/cadans/scripts/mcp-servers/email_mcp_server.py

# Implement Gmail/Outlook integration
# (Similar structure to calendar_mcp_server.py)
```

### 2. Enable Learning Layer

```python
# Add usage tracking to calendar_mcp_server.py

class CalendarMCPServer:
    def __init__(self):
        self.usage_db = sqlite3.connect('calendar_usage.db')
        self._init_db()

    def check_availability(self, date, start, end):
        result = self.provider.check_availability(...)

        # Log for learning
        self.usage_db.execute(
            "INSERT INTO queries (date, start, end, result, timestamp) VALUES (?, ?, ?, ?, ?)",
            (date, start, end, json.dumps(result), datetime.now())
        )

        return result

    def record_booking_outcome(self, slot, accepted: bool):
        """Track which suggestions were accepted"""
        self.usage_db.execute(
            "INSERT INTO outcomes (slot, accepted, timestamp) VALUES (?, ?, ?)",
            (json.dumps(slot), accepted, datetime.now())
        )
        # Future: Train model on this data
```

### 3. Deploy to Production Clients

```bash
# For each new client:
1. Copy mcp-registry.template.json → clients/{client-slug}/scripts/
2. Run OAuth flow for client's calendar
3. Update OAUTH_REFRESH_TOKEN in registry
4. Deploy agent with MCP config
5. Test end-to-end

# Time: 10 minutes per client (vs 90 minutes without MCP!)
```

---

## Performance Optimization

### 1. Cache Calendar Data

```python
class CalendarMCPServer:
    def __init__(self):
        self.cache = TTLCache(maxsize=100, ttl=300)  # 5-minute cache

    def check_availability(self, date, start, end):
        cache_key = f"{date}:{start}:{end}"

        if cache_key in self.cache:
            return self.cache[cache_key]

        result = self.provider.check_availability(...)
        self.cache[cache_key] = result
        return result
```

### 2. Batch Requests

```python
def check_availability_batch(self, dates: List[str]):
    """Check multiple dates at once (reduces API calls)"""
    return [
        self.check_availability(date, "09:00", "18:00")
        for date in dates
    ]
```

### 3. Async Operations

```python
import asyncio

class CalendarMCPServer:
    async def check_availability(self, date, start, end):
        # Non-blocking API calls
        result = await self.provider.check_availability_async(...)
        return result
```

---

## Security Checklist

- [ ] Encrypt OAuth tokens at rest (use NaCl/Fernet)
- [ ] Rotate tokens every 90 days
- [ ] Use credential proxy (see NanoClaw's `credential-proxy.ts`)
- [ ] Redact tokens from logs: `logger.info(f"Token: ***REDACTED***")`
- [ ] Restrict MCP server filesystem access (container sandbox)
- [ ] Validate all inputs (prevent injection attacks)
- [ ] Rate limit API calls (prevent abuse)
- [ ] Monitor for suspicious activity (failed auth attempts)

---

## Cost Monitoring

```python
class CalendarMCPServer:
    def __init__(self):
        self.metrics = MetricsCollector()

    def check_availability(self, date, start, end):
        start_time = time.time()
        result = self.provider.check_availability(...)
        duration = time.time() - start_time

        # Track metrics
        self.metrics.record({
            'tool': 'check_availability',
            'duration_ms': duration * 1000,
            'api_calls': 1,
            'timestamp': datetime.now()
        })

        return result
```

Export metrics for dashboard:

```bash
# Daily cost report
python3 <<EOF
import sqlite3
import json

db = sqlite3.connect('calendar_metrics.db')
cursor = db.execute("""
    SELECT tool, COUNT(*), AVG(duration_ms)
    FROM metrics
    WHERE timestamp > date('now', '-1 day')
    GROUP BY tool
""")

for row in cursor:
    print(f"{row[0]}: {row[1]} calls, avg {row[2]:.2f}ms")
EOF
```

---

## Success Metrics

Track these KPIs:

1. **MCP Server Uptime:** Target >99.9%
2. **API Call Latency:** Target <500ms p95
3. **Agent Token Usage:** Target 70% reduction vs. hardcoded prompts
4. **Deployment Time:** Target <10 minutes per client
5. **User Satisfaction:** Track booking acceptance rate

```python
# Weekly report
def generate_weekly_report():
    return {
        'total_bookings': db.count('outcomes'),
        'acceptance_rate': db.avg('accepted'),
        'avg_latency_ms': db.avg('duration_ms'),
        'api_calls': db.count('queries'),
        'errors': db.count_where('success', False),
        'uptime': calculate_uptime()
    }
```

---

**Time Investment:** 30 minutes for first deployment
**Payoff:** Instant (faster deployments, lower costs, better scaling)

**Next:** Read [SUTTONS-BITTER-LESSON-AND-MCP.md](SUTTONS-BITTER-LESSON-AND-MCP.md) for long-term strategy
