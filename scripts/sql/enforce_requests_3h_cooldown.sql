-- Enforce: each user (identified by user_ip) can submit only 1 request every 3 hours.
-- Run this in Supabase SQL Editor.

BEGIN;

-- Helpful index for fast latest-request lookup per user.
CREATE INDEX IF NOT EXISTS requests_user_ip_created_at_idx
  ON public.requests (user_ip, created_at DESC);

-- Drop old trigger/function safely so script is re-runnable.
DROP TRIGGER IF EXISTS trg_enforce_requests_3h_cooldown ON public.requests;
DROP FUNCTION IF EXISTS public.enforce_requests_3h_cooldown();

CREATE FUNCTION public.enforce_requests_3h_cooldown()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  last_created_at timestamptz;
BEGIN
  IF NEW.user_ip IS NULL OR btrim(NEW.user_ip) = '' THEN
    RAISE EXCEPTION 'user_ip is required for cooldown validation';
  END IF;

  SELECT r.created_at
    INTO last_created_at
  FROM public.requests r
  WHERE r.user_ip = NEW.user_ip
  ORDER BY r.created_at DESC
  LIMIT 1;

  IF last_created_at IS NOT NULL
     AND last_created_at > (now() - interval '3 hours') THEN
    RAISE EXCEPTION
      USING
        ERRCODE = 'P0001',
        MESSAGE = 'You can send only one request every 3 hours.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_requests_3h_cooldown
BEFORE INSERT ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_requests_3h_cooldown();

COMMIT;
