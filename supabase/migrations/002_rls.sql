-- ═══════════════════════════════════════════════════════════════
-- SIMMAM Vendor QR Verification System — Row Level Security
-- Migration: 002_rls.sql
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings           ENABLE ROW LEVEL SECURITY;

-- ─── Helper: Get current user role ───────────────────────────
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─── PROFILES Policies ───────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile (name only, not role)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Super admins can see all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.current_user_role() = 'super_admin');

-- ─── VENDORS Policies ────────────────────────────────────────

-- All authenticated staff can view vendors
CREATE POLICY "vendors_select_staff"
  ON public.vendors FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can create vendors
CREATE POLICY "vendors_insert_admin"
  ON public.vendors FOR INSERT
  WITH CHECK (public.current_user_role() IN ('admin', 'super_admin'));

-- Only admins can update vendors
CREATE POLICY "vendors_update_admin"
  ON public.vendors FOR UPDATE
  USING (public.current_user_role() IN ('admin', 'super_admin'));

-- Only super admins can delete vendors
CREATE POLICY "vendors_delete_super_admin"
  ON public.vendors FOR DELETE
  USING (public.current_user_role() = 'super_admin');

-- ─── VERIFICATION LOGS Policies ──────────────────────────────

-- All authenticated staff can view logs
CREATE POLICY "logs_select_staff"
  ON public.verification_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Logs are inserted via the RPC function (SECURITY DEFINER)
-- so we only need the INSERT policy for direct inserts (admin resets)
CREATE POLICY "logs_insert_staff"
  ON public.verification_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Logs are never updated or deleted (immutable audit trail)
-- (no UPDATE or DELETE policies = no access)

-- ─── SETTINGS Policies ───────────────────────────────────────

-- All staff can read settings
CREATE POLICY "settings_select_staff"
  ON public.settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only super admins can modify settings
CREATE POLICY "settings_modify_super_admin"
  ON public.settings FOR ALL
  USING (public.current_user_role() = 'super_admin');
