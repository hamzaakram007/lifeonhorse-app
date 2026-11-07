-- Freeze profiles.role / is_suspended / admin_notes against client self-escalation.
-- Apply on live Supabase (ebgzqmnewtdippegphou) before or at deploy.
-- Admin/moderator may still change suspension + notes; only admins may change roles.
-- Self-service non-privileged roles go through claim_profile_role() RPC only.
-- Direct SQL / service_role (auth.uid() IS NULL) remains available for break-glass admin promotion.

CREATE OR REPLACE FUNCTION public.profiles_protect_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  role_changed BOOLEAN := NEW.role IS DISTINCT FROM OLD.role;
  suspended_changed BOOLEAN := NEW.is_suspended IS DISTINCT FROM OLD.is_suspended;
  notes_changed BOOLEAN := NEW.admin_notes IS DISTINCT FROM OLD.admin_notes;
  caller UUID := auth.uid();
  allow_rpc BOOLEAN := current_setting('app.allow_role_change', true) = '1';
BEGIN
  IF NOT (role_changed OR suspended_changed OR notes_changed) THEN
    RETURN NEW;
  END IF;

  -- Migrations, SQL editor, and service_role (no JWT user)
  IF caller IS NULL THEN
    RETURN NEW;
  END IF;

  -- Whitelisted self-service role claim via SECURITY DEFINER RPC
  IF allow_rpc AND role_changed AND NOT suspended_changed AND NOT notes_changed THEN
    RETURN NEW;
  END IF;

  -- Admins may change role, suspension, and notes
  IF public.is_admin(caller) THEN
    RETURN NEW;
  END IF;

  -- Moderators may suspend / annotate but never change roles
  IF public.is_admin_or_moderator(caller) THEN
    IF role_changed THEN
      RAISE EXCEPTION 'Only admins can change profiles.role'
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Cannot modify profiles.role, is_suspended, or admin_notes'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_privileged ON public.profiles;
CREATE TRIGGER profiles_protect_privileged
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_protect_privileged_columns();

-- Tighten own-row UPDATE: keep ownership check on both USING and WITH CHECK.
-- Column freeze is enforced by the trigger above (RLS cannot restrict columns).
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id AND is_suspended = false)
  WITH CHECK (auth.uid() = id);

-- Self-service role upgrades: seller / trainer / club_owner / course_creator only.
-- Never accepts admin or moderator.
CREATE OR REPLACE FUNCTION public.claim_profile_role(target_role text)
RETURNS public.user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller UUID := auth.uid();
  current_role public.user_role;
  next_role public.user_role;
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF target_role IS NULL OR target_role NOT IN ('seller', 'trainer', 'club_owner', 'course_creator') THEN
    RAISE EXCEPTION 'Role % is not claimable', target_role
      USING ERRCODE = '22023';
  END IF;

  next_role := target_role::public.user_role;

  SELECT p.role INTO current_role
  FROM public.profiles p
  WHERE p.id = caller
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF current_role IN ('admin', 'moderator') THEN
    RETURN current_role;
  END IF;

  PERFORM set_config('app.allow_role_change', '1', true);

  UPDATE public.profiles
  SET role = next_role
  WHERE id = caller;

  RETURN next_role;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_profile_role(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_profile_role(text) TO authenticated;

COMMENT ON FUNCTION public.claim_profile_role(text) IS
  'Authenticated users may claim seller/trainer/club_owner/course_creator. Never admin/moderator. Prefer SQL or is_admin for privileged roles.';

COMMENT ON FUNCTION public.profiles_protect_privileged_columns() IS
  'Blocks non-admin clients from changing role/is_suspended/admin_notes; RPC sets app.allow_role_change for claimable roles.';
