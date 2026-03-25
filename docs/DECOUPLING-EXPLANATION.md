# Understanding "Decoupling Agent Orchestration from Integration Logic"

**Core Concept:** Separating "what to do" (orchestration) from "how to do it" (integration)

---

## The Problem Without MCP

### Current PA Agent Architecture (Monolithic)

Right now, your Personal Assistant agent has **both responsibilities mixed together**:

```markdown
# agents/personal-assistant/CLAUDE.md (Current)

You are a personal assistant. When a user asks about calendar availability:

1. **ORCHESTRATION (What to do):**
   - Understand the request ("Can I meet Tuesday at 2pm?")
   - Extract date and time
   - Check if it conflicts with existing events
   - Propose alternatives if busy
   - Confirm with user

2. **INTEGRATION (How to do it):**
   - Connect to Google Calendar API
   - Authenticate with OAuth 2.0
   - Call freebusy.query endpoint
   - Parse the response format:
     ```javascript
     const response = await calendar.freebusy.query({
       requestBody: {
         timeMin: `${date}T${startTime}:00+01:00`,
         timeMax: `${date}T${endTime}:00+01:00`,
         items: [{ id: '{CALENDAR_ID}' }]
       }
     });
     const busy = response.data.calendars['{CALENDAR_ID}'].busy;
     // ... 50 more lines of API parsing code
     ```
   - Handle errors (401 Unauthorized, 429 Rate Limit)
   - Format tracking URLs for different carriers (PostNL, DHL, DPD)
```

**Problems with this approach:**

1. **200+ line CLAUDE.md** → High token usage → Higher API costs
2. **Client-specific code** → If Client A uses Google Calendar and Client B uses Microsoft 365, you need TWO different agent prompts
3. **API changes break agents** → Google changes their API → Must update ALL 40 client agents
4. **Hard to test** → Can't test "meeting logic" separately from "Google Calendar API calls"
5. **Slow deployments** → Every new client requires customizing 200 lines of code

---

## The Solution With MCP (Decoupled)

### Split Into Two Layers

```
┌─────────────────────────────────────────────────────────────────┐
│              ORCHESTRATION LAYER (Agent)                         │
│  "WHAT TO DO" - Business logic, conversation flow                │
├─────────────────────────────────────────────────────────────────┤
│  • Understand user intent                                        │
│  • Decide when to check calendar                                 │
│  • Handle conflicts gracefully                                   │
│  • Propose alternatives                                          │
│  • Confirm with user                                             │
└─────────────────────────────┬───────────────────────────────────┘
                              │ Uses MCP tools
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              INTEGRATION LAYER (MCP Server)                      │
│  "HOW TO DO IT" - API calls, data formats, authentication       │
├─────────────────────────────────────────────────────────────────┤
│  • Connect to Google/Microsoft/CalDAV                            │
│  • Handle OAuth tokens                                           │
│  • Parse API responses                                           │
│  • Retry on failures                                             │
│  • Normalize data formats                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Concrete Example: Calendar Availability

### WITHOUT MCP (Coupled/Monolithic)

**agents/personal-assistant/CLAUDE.md** - 200 lines:

```markdown
# Personal Assistant Agent

You are a Dutch business owner's personal assistant.

## Calendar Management

When checking calendar availability:

### Google Calendar Integration
1. Import the Google Calendar API:
   ```javascript
   const { google } = require('googleapis');
   const calendar = google.calendar('v3');
   ```

2. Authenticate with OAuth 2.0:
   ```javascript
   const auth = new google.auth.OAuth2(
     process.env.GOOGLE_CLIENT_ID,
     process.env.GOOGLE_CLIENT_SECRET
   );
   auth.setCredentials({
     refresh_token: process.env.GOOGLE_REFRESH_TOKEN
   });
   ```

3. Check availability:
   ```javascript
   const response = await calendar.freebusy.query({
     auth: auth,
     requestBody: {
       timeMin: '2026-03-26T09:00:00+01:00',
       timeMax: '2026-03-26T18:00:00+01:00',
       items: [{ id: 'primary' }]
     }
   });

   const busySlots = response.data.calendars['primary'].busy;

   // Parse busy slots
   const conflicts = busySlots.map(slot => ({
     start: slot.start,
     end: slot.end
   }));

   // Find free slots
   const freeSlots = [];
   let currentTime = parseTime('09:00');
   for (const busySlot of busySlots) {
     if (currentTime < parseTime(busySlot.start)) {
       freeSlots.push({
         start: formatTime(currentTime),
         end: busySlot.start
       });
     }
     currentTime = parseTime(busySlot.end);
   }
   ```

4. Handle errors:
   - 401 Unauthorized → Token expired, refresh it
   - 403 Forbidden → Check scopes
   - 429 Rate Limit → Exponential backoff
   - 500 Server Error → Retry 3 times

5. Response format:
   ```
   Donderdag 26 maart is beschikbaar:
   • 09:00 - 10:30 (vrij)
   • 10:30 - 11:00 (bezet: Team standup)
   • 11:00 - 13:00 (vrij)
   • 13:00 - 14:00 (bezet: Lunch met Jan)
   • 14:00 - 18:00 (vrij)
   ```

### Microsoft 365 Calendar Integration
[Another 50 lines for Microsoft Graph API...]

### Buffer Time Rules
Always add 15 minutes before/after meetings...
[Another 30 lines...]

### Conflict Detection
Never double-book...
[Another 20 lines...]
```

**Total:** 200+ lines in CLAUDE.md
**Token usage:** ~50,000 tokens per session
**Deployment:** Must customize for each client (Google vs Microsoft)

---

### WITH MCP (Decoupled)

#### Layer 1: Agent Orchestration (50 lines)

**agents/personal-assistant/CLAUDE.md**:

```markdown
# Personal Assistant Agent

You are a Dutch business owner's personal assistant.

## Calendar Management

You have access to a `calendar` MCP server with these tools:

### check_availability(date, start_time, end_time)
Returns free and busy slots for the given timeframe.

**Example:**
```json
calendar.check_availability(
  date="2026-03-26",
  start_time="09:00",
  end_time="18:00"
)

// Returns:
{
  "free_slots": [
    {"start": "09:00", "end": "10:30"},
    {"start": "11:00", "end": "13:00"},
    {"start": "14:00", "end": "18:00"}
  ],
  "busy_slots": [
    {"start": "10:30", "end": "11:00", "title": "Team standup"},
    {"start": "13:00", "end": "14:00", "title": "Lunch met Jan"}
  ]
}
```

### create_event(title, start, end, attendees)
Creates a calendar event.

**Example:**
```json
calendar.create_event(
  title="Meeting met Jan de Bakker",
  start="2026-03-26T14:00:00",
  end="2026-03-26T15:00:00",
  attendees=["jan@bakkerij.nl"]
)
```

## Workflow

When a user asks about meeting availability:
1. Extract date/time from request
2. Use `check_availability()` to get free slots
3. If conflicts exist, propose alternatives
4. After user confirms, use `create_event()`
5. Confirm in Dutch format

**Always add 15-minute buffer** (handled automatically by calendar server).
```

**Total:** 50 lines in CLAUDE.md
**Token usage:** ~15,000 tokens per session (70% reduction!)
**Deployment:** Same prompt for ALL clients (Google/Microsoft/CalDAV)

---

#### Layer 2: Integration Logic (MCP Server)

**scripts/mcp-servers/calendar_mcp_server.py**:

```python
#!/usr/bin/env python3
"""
Calendar MCP Server
Handles Google Calendar, Microsoft 365, and CalDAV
"""

import os
import json
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

PROVIDER = os.environ.get('CALENDAR_PROVIDER', 'google')
OAUTH_TOKEN = os.environ.get('OAUTH_REFRESH_TOKEN')
CALENDAR_ID = os.environ.get('CALENDAR_ID', 'primary')
BUFFER_MINUTES = int(os.environ.get('BUFFER_MINUTES', '15'))

class CalendarMCPServer:
    def __init__(self):
        if PROVIDER == 'google':
            self.client = self._init_google_client()
        elif PROVIDER == 'microsoft':
            self.client = self._init_microsoft_client()
        elif PROVIDER == 'caldav':
            self.client = self._init_caldav_client()

    def _init_google_client(self):
        creds = Credentials.from_authorized_user_info({
            'refresh_token': OAUTH_TOKEN
        })
        return build('calendar', 'v3', credentials=creds)

    def check_availability(self, date: str, start_time: str, end_time: str):
        """Check calendar availability - works for ALL providers"""

        # Build request (Google Calendar API format)
        time_min = f"{date}T{start_time}:00+01:00"
        time_max = f"{date}T{end_time}:00+01:00"

        # Call API (provider-specific logic hidden here)
        if PROVIDER == 'google':
            result = self._google_freebusy(time_min, time_max)
        elif PROVIDER == 'microsoft':
            result = self._microsoft_findmeetingtimes(time_min, time_max)
        elif PROVIDER == 'caldav':
            result = self._caldav_freebusy(time_min, time_max)

        # Normalize response (same format for all providers)
        return {
            'free_slots': result['free'],
            'busy_slots': result['busy']
        }

    def _google_freebusy(self, time_min, time_max):
        """Google Calendar API implementation"""
        response = self.client.freebusy().query(
            body={
                'timeMin': time_min,
                'timeMax': time_max,
                'items': [{'id': CALENDAR_ID}]
            }
        ).execute()

        busy = response['calendars'][CALENDAR_ID]['busy']

        # Calculate free slots from busy slots
        free_slots = self._calculate_free_slots(
            time_min, time_max, busy
        )

        # Add buffer time
        busy_with_buffer = self._add_buffer(busy, BUFFER_MINUTES)

        return {'free': free_slots, 'busy': busy_with_buffer}

    def _microsoft_findmeetingtimes(self, time_min, time_max):
        """Microsoft Graph API implementation"""
        # ... Microsoft-specific logic
        pass

    def _caldav_freebusy(self, time_min, time_max):
        """CalDAV implementation"""
        # ... CalDAV-specific logic
        pass

    def create_event(self, title, start, end, attendees):
        """Create event - works for ALL providers"""
        if PROVIDER == 'google':
            return self._google_create_event(title, start, end, attendees)
        elif PROVIDER == 'microsoft':
            return self._microsoft_create_event(title, start, end, attendees)
        # ... etc

# MCP Server protocol (stdio)
if __name__ == '__main__':
    server = CalendarMCPServer()

    # Read tool calls from stdin, write results to stdout
    for line in sys.stdin:
        request = json.loads(line)

        if request['tool'] == 'check_availability':
            result = server.check_availability(
                request['args']['date'],
                request['args']['start_time'],
                request['args']['end_time']
            )
            print(json.dumps(result))

        elif request['tool'] == 'create_event':
            result = server.create_event(
                request['args']['title'],
                request['args']['start'],
                request['args']['end'],
                request['args']['attendees']
            )
            print(json.dumps(result))
```

**Per-Client Configuration:**

**Client A (Google Calendar):**
```json
{
  "servers": {
    "calendar": {
      "type": "stdio",
      "command": "python3",
      "args": ["/opt/cadans/scripts/mcp-servers/calendar_mcp_server.py"],
      "env": {
        "CALENDAR_PROVIDER": "google",
        "OAUTH_REFRESH_TOKEN": "1//0g_encrypted_token_here",
        "CALENDAR_ID": "primary",
        "BUFFER_MINUTES": "15"
      }
    }
  }
}
```

**Client B (Microsoft 365):**
```json
{
  "servers": {
    "calendar": {
      "type": "stdio",
      "command": "python3",
      "args": ["/opt/cadans/scripts/mcp-servers/calendar_mcp_server.py"],
      "env": {
        "CALENDAR_PROVIDER": "microsoft",
        "OAUTH_REFRESH_TOKEN": "EwB_encrypted_token_here",
        "CALENDAR_ID": "user@company.com",
        "BUFFER_MINUTES": "30"
      }
    }
  }
}
```

**Same agent prompt, different calendar providers!** 🎉

---

## Why This Matters for Cadans

### 1. Deployment Speed

**Without MCP (Coupled):**
```bash
# New client deployment
1. Copy agents/personal-assistant/CLAUDE.md
2. Replace {CALENDAR_PROVIDER} throughout file (20+ places)
3. Replace API endpoint URLs (Google vs Microsoft)
4. Update authentication code
5. Change date format parsing (ISO 8601 vs RFC 3339)
6. Test all API calls
7. Deploy

Time: 90 minutes per client
Error-prone: Easy to miss replacements
```

**With MCP (Decoupled):**
```bash
# New client deployment
1. Copy mcp-registry.template.json
2. Set CALENDAR_PROVIDER=microsoft (1 line)
3. Set OAUTH_REFRESH_TOKEN=xxx (1 line)
4. Deploy

Time: 10 minutes per client
Bulletproof: Agent code never changes
```

---

### 2. Maintenance

**Without MCP (Coupled):**
```
Google changes API endpoint format:
→ Must update 40 client CLAUDE.md files
→ Must redeploy 40 containers
→ Must test 40 clients individually
→ 8 hours of work
```

**With MCP (Decoupled):**
```
Google changes API endpoint format:
→ Update calendar_mcp_server.py (1 file)
→ Restart MCP server (hot reload, no agent redeploy)
→ All 40 clients get fix automatically
→ 30 minutes of work
```

---

### 3. Testing

**Without MCP (Coupled):**
```python
# Can't test agent logic without real Google Calendar API
# Must mock Google API in agent tests
# Tight coupling makes unit tests complex
```

**With MCP (Decoupled):**
```python
# Test agent separately from calendar integration

# Test 1: Agent orchestration (mock MCP)
def test_agent_handles_conflicts():
    mock_calendar = MockMCPServer()
    mock_calendar.check_availability = lambda: {
        'free_slots': [],
        'busy_slots': [{'start': '14:00', 'end': '15:00'}]
    }

    agent = PersonalAssistant(mcp_server=mock_calendar)
    response = agent.handle("Can I meet at 2pm?")

    assert "bezet" in response  # Should say "busy" in Dutch
    assert "alternatieve" in response  # Should propose alternatives

# Test 2: Calendar integration (real API)
def test_google_calendar_integration():
    server = CalendarMCPServer(provider='google')
    result = server.check_availability('2026-03-26', '09:00', '18:00')

    assert 'free_slots' in result
    assert 'busy_slots' in result
```

**Tests are independent!** Agent tests don't need real APIs, MCP server tests don't need agent logic.

---

### 4. Multi-Platform Support

**Without MCP (Coupled):**
```
Support 3 calendar platforms (Google/Microsoft/CalDAV)?
→ Need 3 different agent prompts
→ 3× maintenance burden
→ Hard to keep feature parity
```

**With MCP (Decoupled):**
```
Support 3 calendar platforms?
→ 1 agent prompt
→ 1 MCP server with 3 provider implementations
→ Same features across all platforms (guaranteed)
```

---

## Visual Comparison

### WITHOUT MCP (Coupled)
```
┌──────────────────────────────────────────────────────────────┐
│                    Personal Assistant Agent                   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Orchestration Logic (WHAT)                            │  │
│  │  • Understand intent                                   │  │
│  │  • Handle conflicts                                    │  │
│  │  • Propose alternatives                                │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  Integration Logic (HOW) ← TIGHTLY COUPLED            │  │
│  │  • Google Calendar API calls                           │  │
│  │  • OAuth token management                              │  │
│  │  • Response parsing                                    │  │
│  │  • Error handling                                      │  │
│  │  • Date format conversion                              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Problem: Change Google API → Must update agent prompt       │
│  Problem: Add Microsoft support → Duplicate all logic        │
│  Problem: 200+ line prompt → High token costs               │
└──────────────────────────────────────────────────────────────┘
```

### WITH MCP (Decoupled)
```
┌──────────────────────────────────────────────────────────────┐
│                    Personal Assistant Agent                   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Orchestration Logic (WHAT)                            │  │
│  │  • Understand intent                                   │  │
│  │  • Handle conflicts                                    │  │
│  │  • Propose alternatives                                │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │ Uses MCP tools                     │
│                          ▼                                    │
└──────────────────────────┼────────────────────────────────────┘
                           │
                           │ check_availability()
                           │ create_event()
                           │
┌──────────────────────────┼────────────────────────────────────┐
│                          ▼                                     │
│                  Calendar MCP Server                          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Integration Logic (HOW) ← LOOSELY COUPLED            │  │
│  │                                                         │  │
│  │  if provider == 'google':                              │  │
│  │      # Google Calendar API                             │  │
│  │  elif provider == 'microsoft':                         │  │
│  │      # Microsoft Graph API                             │  │
│  │  elif provider == 'caldav':                            │  │
│  │      # CalDAV protocol                                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Benefit: Change Google API → Update MCP server only         │
│  Benefit: Add Microsoft → Same agent, different config       │
│  Benefit: 50-line agent prompt → Low token costs            │
└──────────────────────────────────────────────────────────────┘
```

---

## Real-World Impact

### Scenario: Google Calendar API Update

**Date:** April 2026
**Change:** Google deprecates `freebusy.query` endpoint, replaces with `availability.check`

#### WITHOUT MCP (Coupled):
```
1. Update agent prompt (200 lines)
2. Test updated prompt
3. Deploy to client-1 → Test
4. Deploy to client-2 → Test
5. Deploy to client-3 → Test
... (repeat 40 times)

Total time: 8 hours
Risk: High (40 deployments, each can fail)
Rollback: Complex (must rollback 40 agents)
```

#### WITH MCP (Decoupled):
```
1. Update calendar_mcp_server.py (change 5 lines)
2. Test MCP server
3. Hot-reload MCP server → All 40 clients get update instantly

Total time: 30 minutes
Risk: Low (1 centralized update)
Rollback: Simple (revert 1 file)
```

**Time saved:** 7.5 hours × €150/hour = €1,125 per API change

---

## Summary

**"Decoupling agent orchestration from integration logic"** means:

### Orchestration Layer (Agent)
- **Focus:** Business logic, conversation flow
- **Questions it answers:**
  - "When should I check calendar?"
  - "How do I handle conflicts?"
  - "What should I say to the user?"
- **Changes rarely:** User experience improvements
- **Same for all clients:** Yes (universal logic)

### Integration Layer (MCP Server)
- **Focus:** Technical implementation, API calls
- **Questions it answers:**
  - "How do I connect to Google Calendar?"
  - "How do I parse API responses?"
  - "How do I handle OAuth tokens?"
- **Changes frequently:** API updates, new providers
- **Same for all clients:** No (per-client configuration)

### The Power of Separation

**Before MCP:** 1 change → 40 agent updates → 8 hours
**After MCP:** 1 change → 1 MCP update → 30 minutes

**Before MCP:** 200-line prompt → 50K tokens → High cost
**After MCP:** 50-line prompt → 15K tokens → Low cost

**Before MCP:** Add provider → Duplicate agent → 2× maintenance
**After MCP:** Add provider → Config change → 0× maintenance

This is why MCP is so powerful for Cadans: **You scale your business (40+ clients) without scaling your maintenance burden.**

---

**Next:** Want me to show you how to implement the first MCP server (Calendar) step-by-step?
