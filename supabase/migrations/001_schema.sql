-- ═══════════════════════════════════════════════════════════════
-- SIMMAM Vendor QR Verification System — Database Schema
-- Migration: 001_schema.sql
-- ═══════════════════════════════════════════════════════════════

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Profiles (extends auth.users with role) ─────────────────
-- Purpose: Store user role and display name for RBAC
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'volunteer'
              CHECK (role IN ('super_admin', 'admin', 'volunteer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase Auth with roles';
COMMENT ON COLUMN public.profiles.role IS 'RBAC role: super_admin, admin, or volunteer';

-- ─── Vendors ─────────────────────────────────────────────────
-- Purpose: Core vendor registry
CREATE TABLE IF NOT EXISTS public.vendors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiers
  vendor_code     TEXT UNIQUE NOT NULL,    -- Human-readable: VEN-001
  qr_token        TEXT UNIQUE NOT NULL,    -- Secure random: SIMMAM-AB83KD92

  -- Business info
  company_name    TEXT NOT NULL CHECK (char_length(company_name) BETWEEN 2 AND 100),
  contact_person  TEXT NOT NULL CHECK (char_length(contact_person) BETWEEN 2 AND 100),
  phone           TEXT NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 20),
  email           TEXT CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$' OR email IS NULL),
  category        TEXT NOT NULL,
  stall_number    TEXT,
  notes           TEXT CHECK (char_length(notes) <= 500),

  -- Verification state (atomic, never trust frontend)
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at     TIMESTAMPTZ,
  verified_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Audit fields
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.vendors IS 'Registered vendors with QR tokens and verification state';
COMMENT ON COLUMN public.vendors.qr_token IS 'Secure random token stored in QR. Format: SIMMAM-XXXXXXXX';
COMMENT ON COLUMN public.vendors.verified IS 'TRUE after successful QR scan. Reset only by admin.';

-- ─── Verification Logs ───────────────────────────────────────
-- Purpose: Immutable audit trail of every scan attempt
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  vendor_id   UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  scanned_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  status      TEXT NOT NULL CHECK (status IN ('SUCCESS', 'DUPLICATE', 'INVALID', 'RESET')),
  qr_token    TEXT,                     -- Raw token scanned (even if invalid)
  metadata    JSONB,                    -- Extra context: device info, IP, etc.

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.verification_logs IS 'Every scan attempt recorded for audit. Never deleted.';
COMMENT ON COLUMN public.verification_logs.status IS 'SUCCESS=verified|DUPLICATE=already done|INVALID=bad QR|RESET=admin reset';

-- ─── Settings ────────────────────────────────────────────────
-- Purpose: Key-value app configuration store
CREATE TABLE IF NOT EXISTS public.settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT UNIQUE NOT NULL,
  value       JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO public.settings (key, value) VALUES
  ('event_name', '"SIMMAM 2026"'),
  ('event_date', '"2026-03-15"'),
  ('organizer', '"SIMATS Engineering Culturals"'),
  ('allow_volunteer_reset', 'false')
ON CONFLICT (key) DO NOTHING;

-- ─── Indexes ─────────────────────────────────────────────────
-- Vendor lookups
CREATE INDEX IF NOT EXISTS idx_vendors_qr_token       ON public.vendors(qr_token);
CREATE INDEX IF NOT EXISTS idx_vendors_vendor_code     ON public.vendors(vendor_code);
CREATE INDEX IF NOT EXISTS idx_vendors_verified        ON public.vendors(verified);
CREATE INDEX IF NOT EXISTS idx_vendors_category        ON public.vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_company_name    ON public.vendors USING gin(to_tsvector('english', company_name));

-- Log lookups
CREATE INDEX IF NOT EXISTS idx_logs_vendor_id          ON public.verification_logs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_logs_scanned_by         ON public.verification_logs(scanned_by);
CREATE INDEX IF NOT EXISTS idx_logs_status             ON public.verification_logs(status);
CREATE INDEX IF NOT EXISTS idx_logs_created_at         ON public.verification_logs(created_at DESC);

-- ─── Updated At Trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── Auto-create profile on signup ───────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'volunteer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
