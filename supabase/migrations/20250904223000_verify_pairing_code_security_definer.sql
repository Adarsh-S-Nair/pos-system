-- Create or replace a SECURITY DEFINER function to verify pairing codes
CREATE OR REPLACE FUNCTION public.verify_pairing_code(p_code TEXT)
RETURNS TABLE(id UUID, expires_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT pairing_codes.id, pairing_codes.expires_at
  FROM pairing_codes
  WHERE pairing_codes.code = p_code
    AND pairing_codes.expires_at > NOW()
    AND pairing_codes.claimed_at IS NULL
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure pair_device is SECURITY DEFINER so it can be called by clients without direct table access
CREATE OR REPLACE FUNCTION public.pair_device(
  p_code TEXT,
  p_device_public_id TEXT,
  p_device_token_hash TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    pairing_record pairing_codes%ROWTYPE;
    device_record devices%ROWTYPE;
BEGIN
    -- Find valid pairing code
    SELECT * INTO pairing_record
    FROM pairing_codes
    WHERE code = p_code
      AND expires_at > NOW()
      AND claimed_at IS NULL;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid or expired pairing code');
    END IF;

    -- Check if device already exists
    SELECT * INTO device_record
    FROM devices
    WHERE device_public_id = p_device_public_id;

    IF FOUND THEN
        UPDATE devices SET
            lane_id = pairing_record.lane_id,
            device_token_hash = p_device_token_hash,
            paired_at = NOW(),
            last_seen_at = NOW(),
            is_active = true,
            revoked_at = NULL,
            updated_at = NOW()
        WHERE id = device_record.id;

        device_record := (SELECT * FROM devices WHERE id = device_record.id);
    ELSE
        INSERT INTO devices (
            store_id, lane_id, type, label, device_public_id,
            device_token_hash, paired_at, last_seen_at, is_active
        ) VALUES (
            pairing_record.store_id, pairing_record.lane_id, 'REGISTER',
            'Paired Device', p_device_public_id, p_device_token_hash,
            NOW(), NOW(), true
        ) RETURNING * INTO device_record;
    END IF;

    UPDATE pairing_codes SET
        claimed_at = NOW(),
        claimed_device_id = device_record.id
    WHERE id = pairing_record.id;

    RETURN json_build_object(
        'success', true,
        'device_id', device_record.id,
        'lane_id', device_record.lane_id,
        'store_id', device_record.store_id
    );
END;
$function$;

-- Restrict and grant execution privileges
REVOKE ALL ON FUNCTION public.verify_pairing_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_pairing_code(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.pair_device(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pair_device(TEXT, TEXT, TEXT) TO anon, authenticated;


