-- ═══════════════════════════════════════════════════════════════
-- SIMMAM Vendor QR Verification System — New Architecture
-- Migration: 004_new_architecture.sql
-- ═══════════════════════════════════════════════════════════════

-- ─── Cleanup Old Schema ──────────────────────────────────────
DROP TABLE IF EXISTS public.verification_logs CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;

-- ─── Vendors Table ───────────────────────────────────────────
CREATE TABLE public.vendors (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id             TEXT UNIQUE NOT NULL, -- e.g., VEN0001
  name                  TEXT NOT NULL,
  mobile                TEXT NOT NULL,
  company               TEXT,
  stall_number          TEXT NOT NULL,
  vehicle_number        TEXT NOT NULL,
  
  -- Storage URLs/paths
  photo                 TEXT NOT NULL,
  
  -- Tracking State
  status                TEXT NOT NULL DEFAULT 'OUTSIDE' CHECK (status IN ('INSIDE', 'OUTSIDE')),
  entry_count           INTEGER NOT NULL DEFAULT 0,
  
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Entry Logs Table ────────────────────────────────────────
CREATE TABLE public.entry_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  action      TEXT NOT NULL CHECK (action IN ('ENTRY', 'EXIT')),
  time        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  coordinator TEXT NOT NULL -- name or ID of the coordinator
);

-- ─── Enable RLS (Allow backend service key to bypass) ────────
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users if needed (frontend might still need some access, 
-- but Express backend will use service role key to bypass RLS)
CREATE POLICY "Enable read access for all authenticated users" ON public.vendors FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable read access for all authenticated users" ON public.entry_logs FOR SELECT USING (auth.uid() IS NOT NULL);

-- ─── Storage Buckets ─────────────────────────────────────────
-- Note: Run these as superuser or manage via Supabase dashboard.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vendor-documents', 'vendor-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('vendor-photos', 'vendor-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the backend (service role bypasses policies, 
-- so we just need minimal public policies if we expose URLs)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('vendor-photos', 'vendor-documents'));
