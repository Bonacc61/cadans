-- Fires intake-notify on every new lead.
--
-- This is what a Supabase "Database Webhook" is under the hood: an AFTER
-- INSERT trigger calling pg_net. Written as SQL rather than configured in the
-- dashboard so the notification path is recorded in git — a rebuild from these
-- migrations alone would otherwise come up with a working form that silently
-- never notifies anyone.
--
-- pg_net is asynchronous and fire-and-forget: the INSERT commits immediately
-- and never waits on HTTP, so a slow or broken SMTP server cannot make the
-- visitor's form submission fail or feel slow. The tradeoff is that nothing
-- observes the outcome — a non-2xx from the function is discarded and never
-- retried. The row is the durable record; the email is best-effort. Check
-- net._http_response to see what actually happened:
--
--   select id, status_code, content, created
--   from net._http_response order by created desc limit 5;
--
-- SECRET HANDLING: the x-webhook-secret value below is a placeholder. The real
-- value is a random string (openssl rand -hex 24) that must match the
-- WEBHOOK_SECRET secret set on the edge function. It is deliberately NOT
-- committed. Substitute it before running this migration, or the function will
-- reject every call with 403.
--
-- The apikey value IS committed on purpose: it is the publishable/anon key,
-- already shipped in landing/home.js, and PostgREST's gateway requires it.

create extension if not exists pg_net;

create or replace function public.notify_intake()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform net.http_post(
    url := 'https://kolfehnnhroobfqxhafe.supabase.co/functions/v1/intake-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'sb_publishable_Y5mZ_ubWiZHs8Ut7CWXc8Q_LNIlFkau',
      'x-webhook-secret', 'PASTE_YOUR_HEX_HERE'
    ),
    body := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
end;
$$;

comment on function public.notify_intake() is
  'AFTER INSERT trigger on intake_submissions. Calls the intake-notify edge '
  'function via pg_net, which emails the lead to jan@cadans.ai over Migadu '
  'SMTP. Fire-and-forget: failures are not retried and do not block the insert.';

drop trigger if exists on_intake_submission_created on public.intake_submissions;

create trigger on_intake_submission_created
  after insert on public.intake_submissions
  for each row execute function public.notify_intake();
