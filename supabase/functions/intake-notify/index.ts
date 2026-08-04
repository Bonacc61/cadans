// intake-notify — fires on a new intake_submissions row (via a Supabase
// Database Webhook) and emails the lead to jan@cadans.ai through Migadu SMTP.
//
// The row is durably stored before this runs, so a send failure never loses a
// lead — but it does lose the NOTIFICATION. Supabase Database Webhooks fire
// through pg_net, which is fire-and-forget: a non-2xx response here is not
// retried. That matters because Migadu Micro hard-bounces past 20 outgoing
// messages per day, account-wide, so a busy morning of manual email can
// silently block the alert while the lead sits unread in the table.
//
// If that becomes a real problem, the fix is a `notified_at` column plus a
// pg_cron sweep over rows where it is still null — not a retry here.
//
// Sending as jan@cadans.ai via Migadu keeps the domain's SPF (-all, Migadu is
// the only authorised sender) intact. Do not swap in a third-party relay
// without adding its include: to the SPF record first.
//
// Deliberately sends ONE message, not two. An acknowledgement to the visitor
// would double consumption of that 20/day cap.
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

interface Submission {
  id?: string;
  created_at?: string;
  interest: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
}

const INTERESTS: Record<string, string> = {
  pa: 'WhatsApp PA: AI-assistent',
  webdev: 'Website of webapplicatie',
  geo: 'GEO: vindbaarheid in AI',
  voice: 'Voice-assistent voor reserveringen',
  automation: 'Workflow-automatisering',
  unknown: 'Weet ik nog niet',
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

// name/company are visitor-controlled and land in the Subject header.
const headerSafe = (v: string) => v.replace(/[\r\n]+/g, ' ').slice(0, 120);

Deno.serve(async (req) => {
  // Only the webhook (holding the shared secret) may trigger a send.
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) {
    return json({ error: 'forbidden' }, 403);
  }

  let record: Submission;
  try {
    const payload = await req.json();
    // Webhook sends { type, record, ... }; also accept a bare record (manual test).
    record = (payload?.record ?? payload) as Submission;
    if (!record?.email || !record?.name) return json({ error: 'missing name/email' }, 400);
  } catch {
    return json({ error: 'bad payload' }, 400);
  }

  const user = Deno.env.get('SMTP_USER')!;
  const to = Deno.env.get('INTAKE_TO') ?? user;
  const port = Number(Deno.env.get('SMTP_PORT') ?? '465');

  const text = [
    `Interesse:  ${INTERESTS[record.interest] ?? record.interest}`,
    `Naam:       ${record.name}`,
    `E-mail:     ${record.email}`,
    `Telefoon:   ${record.phone || '—'}`,
    `Bedrijf:    ${record.company || '—'}`,
    '',
    'Bericht:',
    record.message || '—',
    '',
    '---',
    'Toestemming privacybeleid: ja',
    record.created_at ? `Ontvangen: ${record.created_at}` : '',
    record.id ? `Row: ${record.id}` : '',
  ].filter(Boolean).join('\n');

  try {
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get('SMTP_HOST') ?? 'smtp.migadu.com',
        port,
        tls: port === 465, // implicit TLS on 465; STARTTLS when false (587)
        auth: { username: user, password: Deno.env.get('SMTP_PASS')! },
      },
    });
    await client.send({
      from: `Cadans intake <${user}>`,
      to,
      replyTo: record.email, // replying goes straight to the prospect
      subject: `Intake — ${headerSafe(record.name)}${
        record.company ? ` (${headerSafe(record.company)})` : ''
      }`,
      content: text,
    });
    await client.close();
    return json({ ok: true }, 200);
  } catch (e) {
    // Non-200 for observability only — pg_net will not retry. The row is safe;
    // the alert is not. Check function logs if a lead arrives unannounced.
    console.error('intake-notify send failed:', e);
    return json({ ok: false, error: String(e) }, 500);
  }
});
