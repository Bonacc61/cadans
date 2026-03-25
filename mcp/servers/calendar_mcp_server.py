#!/usr/bin/env python3
"""
Calendar MCP Server for Cadans Personal Assistant
Supports: Google Calendar, Microsoft 365, CalDAV

Usage:
    python3 calendar_mcp_server.py

Environment Variables:
    CALENDAR_PROVIDER: google|microsoft|caldav (default: google)
    OAUTH_REFRESH_TOKEN: OAuth refresh token
    CALENDAR_ID: Calendar identifier (default: primary)
    BUFFER_MINUTES: Minutes to buffer before/after events (default: 15)
    WORKING_HOURS_START: Start of working hours (default: 09:00)
    WORKING_HOURS_END: End of working hours (default: 18:00)
    TIMEZONE: Timezone (default: Europe/Amsterdam)

MCP Protocol:
    Reads JSON from stdin, writes JSON to stdout
    Each line is one tool call request/response
"""

import os
import sys
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging

# Configure logging (stderr, not stdout - stdout is for MCP protocol)
logging.basicConfig(
    level=logging.INFO,
    format='[calendar-mcp] %(levelname)s: %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)

# Configuration from environment
PROVIDER = os.environ.get('CALENDAR_PROVIDER', 'google')
OAUTH_TOKEN = os.environ.get('OAUTH_REFRESH_TOKEN')
CALENDAR_ID = os.environ.get('CALENDAR_ID', 'primary')
BUFFER_MINUTES = int(os.environ.get('BUFFER_MINUTES', '15'))
WORKING_HOURS_START = os.environ.get('WORKING_HOURS_START', '09:00')
WORKING_HOURS_END = os.environ.get('WORKING_HOURS_END', '18:00')
TIMEZONE = os.environ.get('TIMEZONE', 'Europe/Amsterdam')


class CalendarProvider:
    """Abstract base for calendar providers"""

    def check_availability(
        self,
        date: str,
        start_time: str,
        end_time: str
    ) -> Dict[str, Any]:
        """
        Check calendar availability for a given date/time range

        Args:
            date: Date in YYYY-MM-DD format
            start_time: Start time in HH:MM format
            end_time: End time in HH:MM format

        Returns:
            {
                'free_slots': [{'start': 'HH:MM', 'end': 'HH:MM'}, ...],
                'busy_slots': [{'start': 'HH:MM', 'end': 'HH:MM', 'title': '...'}, ...]
            }
        """
        raise NotImplementedError

    def create_event(
        self,
        title: str,
        start: str,
        end: str,
        attendees: Optional[List[str]] = None,
        location: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a calendar event

        Args:
            title: Event title
            start: Start time in ISO 8601 format
            end: End time in ISO 8601 format
            attendees: List of email addresses
            location: Event location
            description: Event description

        Returns:
            {
                'event_id': '...',
                'status': 'confirmed',
                'html_link': '...'
            }
        """
        raise NotImplementedError

    def get_events(
        self,
        date_from: str,
        date_to: str
    ) -> List[Dict[str, Any]]:
        """
        Get events in a date range

        Args:
            date_from: Start date in YYYY-MM-DD format
            date_to: End date in YYYY-MM-DD format

        Returns:
            [{'id': '...', 'title': '...', 'start': '...', 'end': '...'}]
        """
        raise NotImplementedError


class GoogleCalendarProvider(CalendarProvider):
    """Google Calendar API implementation"""

    def __init__(self):
        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build

            # Initialize credentials
            creds = Credentials.from_authorized_user_info({
                'refresh_token': OAUTH_TOKEN,
                'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
                'client_secret': os.environ.get('GOOGLE_CLIENT_SECRET')
            })

            self.service = build('calendar', 'v3', credentials=creds)
            logger.info("Google Calendar provider initialized")

        except ImportError:
            logger.error("google-api-python-client not installed. Run: pip install google-api-python-client google-auth")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize Google Calendar: {e}")
            raise

    def check_availability(self, date: str, start_time: str, end_time: str) -> Dict[str, Any]:
        time_min = f"{date}T{start_time}:00+01:00"
        time_max = f"{date}T{end_time}:00+01:00"

        try:
            # Query freebusy
            body = {
                'timeMin': time_min,
                'timeMax': time_max,
                'items': [{'id': CALENDAR_ID}]
            }

            result = self.service.freebusy().query(body=body).execute()
            busy_periods = result['calendars'][CALENDAR_ID].get('busy', [])

            # Get event details for busy periods
            events_result = self.service.events().list(
                calendarId=CALENDAR_ID,
                timeMin=time_min,
                timeMax=time_max,
                singleEvents=True,
                orderBy='startTime'
            ).execute()

            events = events_result.get('items', [])

            # Build busy slots with titles
            busy_slots = []
            for event in events:
                if event.get('transparency') == 'transparent':
                    continue  # Skip "free" events

                start = event['start'].get('dateTime', event['start'].get('date'))
                end = event['end'].get('dateTime', event['end'].get('date'))

                # Extract time only
                start_time_str = datetime.fromisoformat(start.replace('Z', '+00:00')).strftime('%H:%M')
                end_time_str = datetime.fromisoformat(end.replace('Z', '+00:00')).strftime('%H:%M')

                busy_slots.append({
                    'start': start_time_str,
                    'end': end_time_str,
                    'title': event.get('summary', 'Busy')
                })

            # Add buffer time
            busy_with_buffer = self._add_buffer(busy_slots)

            # Calculate free slots
            free_slots = self._calculate_free_slots(
                start_time, end_time, busy_with_buffer
            )

            return {
                'free_slots': free_slots,
                'busy_slots': busy_slots
            }

        except Exception as e:
            logger.error(f"Error checking availability: {e}")
            return {'error': str(e)}

    def create_event(
        self,
        title: str,
        start: str,
        end: str,
        attendees: Optional[List[str]] = None,
        location: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            event = {
                'summary': title,
                'start': {
                    'dateTime': start,
                    'timeZone': TIMEZONE
                },
                'end': {
                    'dateTime': end,
                    'timeZone': TIMEZONE
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # 24h before
                        {'method': 'popup', 'minutes': 15}        # 15min before
                    ]
                }
            }

            if attendees:
                event['attendees'] = [{'email': email} for email in attendees]

            if location:
                event['location'] = location

            if description:
                event['description'] = description

            created_event = self.service.events().insert(
                calendarId=CALENDAR_ID,
                body=event
            ).execute()

            return {
                'event_id': created_event['id'],
                'status': created_event['status'],
                'html_link': created_event.get('htmlLink', '')
            }

        except Exception as e:
            logger.error(f"Error creating event: {e}")
            return {'error': str(e)}

    def get_events(self, date_from: str, date_to: str) -> List[Dict[str, Any]]:
        try:
            time_min = f"{date_from}T00:00:00+01:00"
            time_max = f"{date_to}T23:59:59+01:00"

            events_result = self.service.events().list(
                calendarId=CALENDAR_ID,
                timeMin=time_min,
                timeMax=time_max,
                singleEvents=True,
                orderBy='startTime'
            ).execute()

            events = []
            for event in events_result.get('items', []):
                start = event['start'].get('dateTime', event['start'].get('date'))
                end = event['end'].get('dateTime', event['end'].get('date'))

                events.append({
                    'id': event['id'],
                    'title': event.get('summary', 'Untitled'),
                    'start': start,
                    'end': end,
                    'location': event.get('location', ''),
                    'attendees': [a['email'] for a in event.get('attendees', [])]
                })

            return events

        except Exception as e:
            logger.error(f"Error getting events: {e}")
            return []

    def _add_buffer(self, busy_slots: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Add buffer time before/after each busy slot"""
        buffered = []

        for slot in busy_slots:
            start_dt = datetime.strptime(slot['start'], '%H:%M')
            end_dt = datetime.strptime(slot['end'], '%H:%M')

            # Add buffer
            buffered_start = start_dt - timedelta(minutes=BUFFER_MINUTES)
            buffered_end = end_dt + timedelta(minutes=BUFFER_MINUTES)

            buffered.append({
                'start': buffered_start.strftime('%H:%M'),
                'end': buffered_end.strftime('%H:%M'),
                'title': slot.get('title', 'Busy')
            })

        return buffered

    def _calculate_free_slots(
        self,
        start_time: str,
        end_time: str,
        busy_slots: List[Dict[str, str]]
    ) -> List[Dict[str, str]]:
        """Calculate free time slots from busy slots"""
        free_slots = []

        current_time = datetime.strptime(start_time, '%H:%M')
        end_dt = datetime.strptime(end_time, '%H:%M')

        # Sort busy slots by start time
        sorted_busy = sorted(busy_slots, key=lambda x: x['start'])

        for busy in sorted_busy:
            busy_start = datetime.strptime(busy['start'], '%H:%M')

            # If there's a gap before this busy slot
            if current_time < busy_start:
                free_slots.append({
                    'start': current_time.strftime('%H:%M'),
                    'end': busy_start.strftime('%H:%M')
                })

            # Move current time to end of this busy slot
            busy_end = datetime.strptime(busy['end'], '%H:%M')
            current_time = max(current_time, busy_end)

        # Add final free slot if there's time left
        if current_time < end_dt:
            free_slots.append({
                'start': current_time.strftime('%H:%M'),
                'end': end_dt.strftime('%H:%M')
            })

        return free_slots


class MicrosoftCalendarProvider(CalendarProvider):
    """Microsoft 365 Calendar (Graph API) implementation"""

    def __init__(self):
        logger.warning("Microsoft Calendar provider not yet implemented")
        # TODO: Implement using Microsoft Graph API
        # https://learn.microsoft.com/en-us/graph/api/calendar-get

    def check_availability(self, date: str, start_time: str, end_time: str) -> Dict[str, Any]:
        return {'error': 'Microsoft Calendar not yet implemented'}

    def create_event(self, title: str, start: str, end: str, **kwargs) -> Dict[str, Any]:
        return {'error': 'Microsoft Calendar not yet implemented'}

    def get_events(self, date_from: str, date_to: str) -> List[Dict[str, Any]]:
        return []


class CalDAVProvider(CalendarProvider):
    """CalDAV protocol implementation"""

    def __init__(self):
        logger.warning("CalDAV provider not yet implemented")
        # TODO: Implement using caldav library

    def check_availability(self, date: str, start_time: str, end_time: str) -> Dict[str, Any]:
        return {'error': 'CalDAV not yet implemented'}

    def create_event(self, title: str, start: str, end: str, **kwargs) -> Dict[str, Any]:
        return {'error': 'CalDAV not yet implemented'}

    def get_events(self, date_from: str, date_to: str) -> List[Dict[str, Any]]:
        return []


class CalendarMCPServer:
    """MCP Server for calendar operations"""

    def __init__(self):
        # Initialize provider
        if PROVIDER == 'google':
            self.provider = GoogleCalendarProvider()
        elif PROVIDER == 'microsoft':
            self.provider = MicrosoftCalendarProvider()
        elif PROVIDER == 'caldav':
            self.provider = CalDAVProvider()
        else:
            raise ValueError(f"Unknown provider: {PROVIDER}")

        logger.info(f"Calendar MCP Server initialized with {PROVIDER} provider")

    def handle_tool_call(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle a tool call request"""
        tool = request.get('tool')
        args = request.get('args', {})

        try:
            if tool == 'check_availability':
                result = self.provider.check_availability(
                    args['date'],
                    args['start_time'],
                    args['end_time']
                )
                return {'success': True, 'result': result}

            elif tool == 'create_event':
                result = self.provider.create_event(
                    args['title'],
                    args['start'],
                    args['end'],
                    attendees=args.get('attendees'),
                    location=args.get('location'),
                    description=args.get('description')
                )
                return {'success': True, 'result': result}

            elif tool == 'get_events':
                result = self.provider.get_events(
                    args['date_from'],
                    args['date_to']
                )
                return {'success': True, 'result': result}

            elif tool == 'health_check':
                return {
                    'success': True,
                    'result': {
                        'status': 'healthy',
                        'provider': PROVIDER,
                        'calendar_id': CALENDAR_ID,
                        'buffer_minutes': BUFFER_MINUTES
                    }
                }

            else:
                return {'success': False, 'error': f'Unknown tool: {tool}'}

        except Exception as e:
            logger.error(f"Error handling tool call: {e}")
            return {'success': False, 'error': str(e)}

    def run(self):
        """Main MCP server loop - read from stdin, write to stdout"""
        logger.info("MCP Server ready, waiting for tool calls...")

        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue

            try:
                request = json.loads(line)
                response = self.handle_tool_call(request)
                print(json.dumps(response), flush=True)

            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON: {e}")
                print(json.dumps({'success': False, 'error': 'Invalid JSON'}), flush=True)

            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                print(json.dumps({'success': False, 'error': str(e)}), flush=True)


if __name__ == '__main__':
    if not OAUTH_TOKEN:
        logger.error("OAUTH_REFRESH_TOKEN environment variable not set")
        sys.exit(1)

    try:
        server = CalendarMCPServer()
        server.run()
    except KeyboardInterrupt:
        logger.info("Server stopped")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)
