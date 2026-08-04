-- 12-month retention for intake submissions.
--
-- The privacy policy promises deletion no later than 12 months after the last
-- contact. That promise needs a job behind it, not an intention.
--
-- Requires the pg_cron extension. If this migration fails on the
-- `create extension` line, enable pg_cron in the dashboard first:
--   Database → Extensions → pg_cron → enable.

create extension if not exists pg_cron;

create or replace function public.purge_old_intake_submissions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  delete from public.intake_submissions
  where created_at < now() - interval '12 months';

  get diagnostics removed = row_count;
  return removed;
end;
$$;

comment on function public.purge_old_intake_submissions() is
  'Deletes intake submissions older than 12 months. Scheduled nightly via '
  'pg_cron. Backs the retention claim in the privacy policy.';

-- Never callable from the browser — this runs as the cron/postgres role only.
revoke all on function public.purge_old_intake_submissions() from public, anon, authenticated;

-- 03:15 UTC nightly. Unschedule first so re-running the migration is safe.
select cron.unschedule('purge-intake-submissions')
where exists (
  select 1 from cron.job where jobname = 'purge-intake-submissions'
);

select cron.schedule(
  'purge-intake-submissions',
  '15 3 * * *',
  $$select public.purge_old_intake_submissions()$$
);
