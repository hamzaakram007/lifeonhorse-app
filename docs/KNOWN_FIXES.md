# Known Fixes

1. **Signup trigger:** `handle_new_user` must use `public.profiles` with `SET search_path = ''`
2. **SUPABASE_SERVICE_ROLE_KEY:** Must be JWT service role key — NOT a REST URL
3. **Google Fonts:** Playfair Display + Source Sans 3 — add local/system fallback for offline builds
4. **tsconfig paths:** `@/*` maps to `./*` not `./src/*`

## Patched SQL (from main chat)

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$;
```
