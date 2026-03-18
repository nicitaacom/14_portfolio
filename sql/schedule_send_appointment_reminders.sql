-- Deploy the function without JWT verification so pg_net can call it directly:
-- supabase functions deploy send-appointment-reminders --no-verify-jwt

-- Requires pg_cron and pg_net.
-- Replace <PROJECT_REF> with your Supabase project ref.

select cron.schedule(
  'send-appointment-reminders-every-minute',
  '* * * * *',
  $$
  select
    net.http_post(
      url := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-appointment-reminders',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
