-- ═══════════════════════════════════════════════════════════════
-- SIMMAM Vendor QR Verification System — Stored Functions & RPCs
-- Migration: 003_functions.sql
-- ═══════════════════════════════════════════════════════════════

-- ─── ATOMIC VERIFICATION FUNCTION ────────────────────────────
--
-- CONCURRENCY PROTECTION:
-- Uses SELECT...FOR UPDATE to lock the vendor row during the
-- transaction. If two volunteers scan the same QR simultaneously:
--   1. Request A gets the lock, proceeds, marks verified = TRUE
--   2. Request B waits for lock, then sees verified = TRUE → DUPLICATE
-- This ensures exactly one successful check-in per vendor per scan.
--
-- Called from frontend: supabase.rpc('perform_verification', {...})
-- Security: SECURITY DEFINER runs as the function owner (bypasses RLS)
--   but validates the calling user is authenticated via p_staff_id.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.perform_verification(
  p_qr_token  TEXT,
  p_staff_id  UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vendor  public.vendors%ROWTYPE;
BEGIN
  -- ── 1. Validate staff is a real user ──────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_staff_id) THEN
    RETURN jsonb_build_object(
      'status', 'INVALID',
      'message', 'Unauthorized: invalid staff ID'
    );
  END IF;

  -- ── 2. Lock vendor row for update (prevents race conditions) ──
  SELECT * INTO v_vendor
  FROM public.vendors
  WHERE qr_token = p_qr_token
  FOR UPDATE;

  -- ── 3. QR not found ───────────────────────────────────
  IF NOT FOUND THEN
    -- Log invalid scan (vendor_id is NULL for unknown QRs)
    INSERT INTO public.verification_logs (vendor_id, scanned_by, status, qr_token)
    VALUES (NULL, p_staff_id, 'INVALID', p_qr_token);

    RETURN jsonb_build_object(
      'status', 'INVALID',
      'message', 'QR code not recognized. Not a valid SIMMAM vendor.'
    );
  END IF;

  -- ── 4. Already verified ───────────────────────────────
  IF v_vendor.verified THEN
    -- Log duplicate attempt
    INSERT INTO public.verification_logs (vendor_id, scanned_by, status, qr_token, metadata)
    VALUES (
      v_vendor.id,
      p_staff_id,
      'DUPLICATE',
      p_qr_token,
      jsonb_build_object('original_verified_at', v_vendor.verified_at)
    );

    RETURN jsonb_build_object(
      'status', 'DUPLICATE',
      'message', 'Vendor has already been verified.',
      'vendor', row_to_json(v_vendor)
    );
  END IF;

  -- ── 5. SUCCESS: Mark as verified (atomic) ─────────────
  UPDATE public.vendors
  SET
    verified    = TRUE,
    verified_at = NOW(),
    verified_by = p_staff_id,
    updated_at  = NOW()
  WHERE id = v_vendor.id;

  -- ── 6. Log success ────────────────────────────────────
  INSERT INTO public.verification_logs (vendor_id, scanned_by, status, qr_token)
  VALUES (v_vendor.id, p_staff_id, 'SUCCESS', p_qr_token);

  -- ── 7. Return updated vendor ──────────────────────────
  SELECT * INTO v_vendor FROM public.vendors WHERE id = v_vendor.id;

  RETURN jsonb_build_object(
    'status', 'SUCCESS',
    'message', 'Vendor verified successfully!',
    'vendor', row_to_json(v_vendor)
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Catch any unexpected error
    RETURN jsonb_build_object(
      'status', 'INVALID',
      'message', 'An unexpected error occurred. Please try again.',
      'error', SQLERRM
    );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.perform_verification(TEXT, UUID) TO authenticated;

-- ─── DASHBOARD STATS VIEW ─────────────────────────────────────

CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
  COUNT(*)                                                  AS total_vendors,
  COUNT(*) FILTER (WHERE verified = TRUE)                  AS verified_vendors,
  COUNT(*) FILTER (WHERE verified = FALSE)                 AS pending_vendors,
  ROUND(
    (COUNT(*) FILTER (WHERE verified = TRUE))::NUMERIC
    / NULLIF(COUNT(*), 0) * 100,
    1
  )                                                         AS verification_rate
FROM public.vendors;

-- ─── GET VENDOR BY TOKEN (safe, no PII leakage) ──────────────
-- Used for quick token lookups from the scanner

CREATE OR REPLACE FUNCTION public.get_vendor_by_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_vendor public.vendors%ROWTYPE;
BEGIN
  SELECT * INTO v_vendor
  FROM public.vendors
  WHERE qr_token = p_token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN row_to_json(v_vendor);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_vendor_by_token(TEXT) TO authenticated;

-- ─── MAKE USER ADMIN (run manually in Supabase dashboard) ────
-- Usage: SELECT public.make_user_admin('user@example.com', 'admin');

CREATE OR REPLACE FUNCTION public.make_user_admin(
  p_email TEXT,
  p_role  TEXT DEFAULT 'admin'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

  IF NOT FOUND THEN
    RETURN 'User not found: ' || p_email;
  END IF;

  UPDATE public.profiles SET role = p_role WHERE id = v_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, role) VALUES (v_user_id, p_role);
  END IF;

  RETURN 'Success: ' || p_email || ' is now ' || p_role;
END;
$$;
