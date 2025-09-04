-- Enable cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS pairing_codes_expires_at_idx ON public.pairing_codes(expires_at);
CREATE INDEX IF NOT EXISTS pairing_codes_claimed_at_idx ON public.pairing_codes(claimed_at);

-- Unschedule existing job (if present) to keep this idempotent
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup_pairing_codes') THEN
    PERFORM cron.unschedule((SELECT jobid FROM cron.job WHERE jobname = 'cleanup_pairing_codes'));
  END IF;
END $$;

-- Schedule cleanup every 15 minutes
SELECT cron.schedule(
  'cleanup_pairing_codes',
  '*/15 * * * *',
  $$
    DELETE FROM public.pairing_codes
    WHERE expires_at < NOW()
       OR (claimed_at IS NOT NULL AND claimed_at < NOW() - INTERVAL '1 day');
  $$
);


