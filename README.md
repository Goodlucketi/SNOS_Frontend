# SNOS Frontend (TypeScript) - Backend Integration Pass

This was an AI-Studio-generated redesign. Visually and structurally it's
solid, but most of the admin-facing functionality never actually talked
to a backend - it was client-side mockups (hardcoded credentials,
`localStorage` standing in for a database). This pass wires everything
to the real, secured PHP backend (`SNOS_Backend_v2`).

## Run locally

```bash
npm install
npm run dev
```

`server.ts` proxies any request to `/api/*` through to
`https://snos.teledominternational.net/*` (see the proxy code there) -
no frontend env var changes needed for that to work.

## What was completely fake and is now real

- **Admin login** (`AdminLogin.tsx`): previously authenticated entirely
  client-side against a hardcoded super-admin password shipped in
  plaintext in the JS bundle, plus a fake admin "database" in
  `localStorage` (also plaintext passwords). Now calls the real
  `/users/login.php` and checks the returned role.
- **Admin CRUD** (deploying/editing/deleting administrators from the
  Admin Panel's "Security Administrators" tab): previously only wrote to
  `localStorage`. Now calls the real `admin/create_admin.php`,
  `admin/update_user.php`, `admin/update_admin_role.php`,
  `admin/reset_admin_password.php`, `admin/delete_admin.php`,
  `admin/list_admins.php`.
- **User CRUD** from the Admin Panel (add/edit/delete gateway
  operators): previously only wrote to `localStorage`, silently
  shadowing the real API after the first load - edits never reached the
  real database. Now calls `users/create.php`, `admin/update_user.php`,
  `admin/delete_user.php`.
- **Settings page** notification toggles: previously `setTimeout` +
  a fake success toast, no persistence at all. Now calls
  `users/update_settings.php` / `users/read_settings.php`.
- **Contact form** and **newsletter signup**: previously toast-only, no
  request ever sent. Now call `contact/send.php` /
  `newsletter/subscribe.php`.
- **Password change**: didn't exist as a feature in this build at all;
  added to the Settings page, calling `users/change_password.php`.

Admin/super_admin accounts can no longer be created client-side - they
need to be provisioned via the backend (`setup/create_admin.php`, or by
an existing super_admin through the now-real Admin Panel).

## Real bugs fixed along the way

- **Login/Signup silently faked success on real failures.** Both
  `Login.tsx` and `SignUp.tsx` had a catch-all pattern where *any*
  error - including the server correctly rejecting a wrong password or
  a duplicate account - fell through to a fake "demo mode" login or a
  fake "registered successfully" toast. This meant the login/signup
  forms never actually blocked invalid input; a wrong password just
  silently logged you into a fake session instead of showing an error.
  Fixed: a real response from the server (4xx/5xx) now shows the real
  error and stops there; only a genuine connection failure (no response
  at all) gets a distinct, honest message, and demo mode requires an
  explicit button click, never an automatic fallback.
- **The client's own Alerts page showed fabricated intrusion alerts**
  ("Intruder detected...", "Garage door opened...") whenever the real
  alert list was simply empty - which is the normal state for any new
  account with no incidents yet, not an error. For a security product,
  this could seriously and needlessly alarm a real user into thinking a
  break-in happened when it didn't. Removed - a genuinely empty list now
  shows the real (perfectly good) empty state that already existed but
  was unreachable.
- **`admin/update_user.php`/`delete_user.php` status string mismatch**:
  the "mark as complete" action sent `status: "complete"` but the
  backend's whitelist only accepted `"completed"` - every resolve action
  from the admin panel would have been rejected. Backend now accepts
  both.
- Passwords were displayed and re-editable in plaintext in the Admin
  Management modal (pre-filled from a fake local record). The real
  backend never returns password hashes, so editing an existing admin's
  password is now a separate, optional "leave blank to keep current"
  field that calls a dedicated reset endpoint only when filled in.
- `Settings.tsx` had a real syntax hack -
  `const { theme, toggleTheme } = themeContext = useTheme();` paired
  with a module-level `let themeContext: any;` "polyfill" - that
  happened to work via module hoisting but served no purpose. Replaced
  with plain hook usage.
- Global auth wiring added: `AuthContext` now stores the real JWT
  returned by login and attaches it to every request via
  `axios.defaults.headers.common['Authorization']`, so all the
  already-correct API calls throughout the app (which were previously
  sending no auth header at all, and would have gotten 401s against the
  secured backend) now actually authenticate.

## Known local-only state (not yet backed by the database)

`Settings.tsx`'s "Designated Rapid Response Dispatch" (secondary
contact name/number) and "Gateway Siren Volume" fields are UI-only -
there's no backend schema for them yet. They're clearly labeled in the
UI as not-yet-saved. Add the corresponding columns/table and endpoints
if you want these persisted.
