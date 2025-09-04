-- Create lanes table
CREATE TABLE lanes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create devices table
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
    lane_id UUID REFERENCES lanes(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('REGISTER', 'TERMINAL', 'CUSTOMER_DISPLAY')),
    label TEXT NOT NULL,
    device_public_id TEXT UNIQUE, -- Browser's local UUID
    device_token_hash TEXT, -- Hash of opaque token returned to device
    paired_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create pairing_codes table
CREATE TABLE pairing_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    store_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
    lane_id UUID REFERENCES lanes(id) ON DELETE CASCADE,
    generated_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    claimed_at TIMESTAMPTZ,
    claimed_device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    attempts_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add partial unique constraint: one REGISTER per lane_id
CREATE UNIQUE INDEX devices_one_register_per_lane 
ON devices (lane_id) 
WHERE type = 'REGISTER' AND is_active = true;

-- Add indexes for performance
CREATE INDEX idx_lanes_store_id ON lanes(store_id);
CREATE INDEX idx_lanes_status ON lanes(status);
CREATE INDEX idx_devices_store_id ON devices(store_id);
CREATE INDEX idx_devices_lane_id ON devices(lane_id);
CREATE INDEX idx_devices_type ON devices(type);
CREATE INDEX idx_devices_is_active ON devices(is_active);
CREATE INDEX idx_devices_device_public_id ON devices(device_public_id);
CREATE INDEX idx_pairing_codes_code ON pairing_codes(code);
CREATE INDEX idx_pairing_codes_store_id ON pairing_codes(store_id);
CREATE INDEX idx_pairing_codes_expires_at ON pairing_codes(expires_at);
CREATE INDEX idx_pairing_codes_claimed_at ON pairing_codes(claimed_at);

-- Add updated_at trigger for lanes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lanes_updated_at 
    BEFORE UPDATE ON lanes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at 
    BEFORE UPDATE ON devices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE lanes ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairing_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lanes
CREATE POLICY "Users can view lanes for their store" ON lanes
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert lanes for their store" ON lanes
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update lanes for their store" ON lanes
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete lanes for their store" ON lanes
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

-- RLS Policies for devices
CREATE POLICY "Users can view devices for their store" ON devices
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert devices for their store" ON devices
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update devices for their store" ON devices
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete devices for their store" ON devices
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

-- RLS Policies for pairing_codes
CREATE POLICY "Users can view pairing codes for their store" ON pairing_codes
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert pairing codes for their store" ON pairing_codes
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update pairing codes for their store" ON pairing_codes
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM business_profiles 
            WHERE owner_id = auth.uid()
        )
    );

-- Add function to clean up expired pairing codes
CREATE OR REPLACE FUNCTION cleanup_expired_pairing_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM pairing_codes 
    WHERE expires_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Add function to generate unique pairing code
CREATE OR REPLACE FUNCTION generate_pairing_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate 6-character alphanumeric code
        code := upper(substring(md5(random()::text) from 1 for 6));
        
        -- Check if code already exists and is not expired
        SELECT COUNT(*) INTO exists_count 
        FROM pairing_codes 
        WHERE pairing_codes.code = generate_pairing_code.code 
        AND expires_at > NOW();
        
        -- If code doesn't exist or is expired, we can use it
        EXIT WHEN exists_count = 0;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Add function to pair device
CREATE OR REPLACE FUNCTION pair_device(
    p_code TEXT,
    p_device_public_id TEXT,
    p_device_token_hash TEXT
)
RETURNS JSON AS $$
DECLARE
    pairing_record pairing_codes%ROWTYPE;
    device_record devices%ROWTYPE;
    result JSON;
BEGIN
    -- Find valid pairing code
    SELECT * INTO pairing_record
    FROM pairing_codes
    WHERE code = p_code
    AND expires_at > NOW()
    AND claimed_at IS NULL;
    
    -- If no valid code found
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid or expired pairing code');
    END IF;
    
    -- Check if device already exists
    SELECT * INTO device_record
    FROM devices
    WHERE device_public_id = p_device_public_id;
    
    -- If device exists, update it
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
        -- Create new device
        INSERT INTO devices (
            store_id, lane_id, type, label, device_public_id, 
            device_token_hash, paired_at, last_seen_at, is_active
        ) VALUES (
            pairing_record.store_id, pairing_record.lane_id, 'REGISTER', 
            'Paired Device', p_device_public_id, p_device_token_hash, 
            NOW(), NOW(), true
        ) RETURNING * INTO device_record;
    END IF;
    
    -- Mark pairing code as claimed
    UPDATE pairing_codes SET
        claimed_at = NOW(),
        claimed_device_id = device_record.id
    WHERE id = pairing_record.id;
    
    -- Return success with device info
    RETURN json_build_object(
        'success', true,
        'device_id', device_record.id,
        'lane_id', device_record.lane_id,
        'store_id', device_record.store_id
    );
END;
$$ LANGUAGE plpgsql;
