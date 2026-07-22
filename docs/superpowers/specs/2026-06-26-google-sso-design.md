# Google SSO Design

## Goal

Add Google Workspace/Gmail company SSO to PTOps while keeping the current username/password login as an admin fallback. The implementation extends the existing `SSO` subsystem instead of introducing a separate auth stack.

## Existing integration points

- `lib/sso.js` owns current SSO behavior, user provisioning, session cookie creation, and SSO logout messaging.
- `lib/engine.js` calls `ssoSetup()` during startup and routes `/` through `handleSSO()` when `SSO.enabled` is true.
- `lib/api.js` registers the `app` API namespace, so new API handlers should use `/api/app/<action>` routes.
- `lib/api/config.js` sends unauthenticated bootstrap config to the browser and must only expose non-sensitive SSO fields.
- `htdocs/js/pages/Login.class.js` renders the local username/password login form.
- User activity and audit logging flow through `afterUserLogin()`, `logActivity()`, `logUserActivity()`, and `logTransaction()`.

## Configuration

Google SSO uses the existing top-level `SSO` config key:

```json
{
  "SSO": {
    "enabled": true,
    "provider": "google",
    "client_id": "xxx.apps.googleusercontent.com",
    "client_secret": "env:XYOPS_GOOGLE_CLIENT_SECRET",
    "redirect_uri": "https://xyops.company.com/api/app/google_sso_callback",
    "allowed_domains": ["company.com"],
    "auto_provision": true,
    "default_role": "viewer",
    "button_label": "Sign in with Google",
    "allow_local_login": true,
    "require_sso_for_non_admins": false
  }
}
```

`client_secret` is resolved server-side. `env:NAME` reads from `process.env.NAME`. The secret is never returned in API responses, written to browser storage, or included in logs.

`/api/app/config` exposes only this safe public subset as `config.sso`:

```json
{
  "enabled": true,
  "provider": "google",
  "button_label": "Sign in with Google",
  "allow_local_login": true
}
```

## Routes

Routes follow the existing `app` API namespace convention:

- `GET /api/app/google_sso_start`
- `GET /api/app/google_sso_callback`

The callback URI in Google Cloud Console must match `/api/app/google_sso_callback` unless an operator overrides `SSO.redirect_uri`.

## Authentication flow

1. Login page shows a Google button when public config says Google SSO is enabled.
2. User clicks the button and browser navigates to `/api/app/google_sso_start`.
3. Backend validates SSO config, fetches Google discovery metadata, creates random `state` and `nonce`, and stores them at `sessions/sso/google/<state>` with a short TTL.
4. Backend redirects to Google authorization endpoint with scope `openid email profile`, `state`, `nonce`, `client_id`, `redirect_uri`, and optional `hd` when exactly one allowed domain is configured.
5. Callback verifies `state`, deletes it to enforce single use, exchanges `code` at Google token endpoint, and validates the ID token using a standard OIDC/JWT library.
6. ID token validation checks signature via JWKS, `iss`, `aud`, `exp`, `nonce`, `email_verified === true`, and email domain allowlist.
7. Verified claims are mapped to a PTOps user.
8. PTOps creates the normal session record and `session_id` cookie using the same settings as local/SSO login.
9. Browser redirects to the app root or a validated same-origin target.

Access tokens and ID tokens are not persisted. Refresh tokens are not requested or stored.

## User mapping and provisioning

Matching order:

1. Existing user with `sso.google.sub` matching the verified Google `sub`.
2. Existing active user with email matching the verified Google email, case-insensitive.
3. New user only when `SSO.auto_provision === true`.

When an existing local user email matches, the account is linked by saving `sso.google.sub`. Username collisions with a different email are rejected and are not merged.

For auto-provisioning:

- Email comes from `email` claim.
- Full name comes from `name` claim, falling back to username/email.
- Username starts from the local-part of the email, normalized to PTOps username rules.
- If the username exists with a different email, a deterministic safe suffix is chosen or the login is rejected if a safe username cannot be produced.
- User is marked `remote: true` and `sync: true`.
- User receives no admin privilege. If `SSO.default_role` is configured and exists, it is assigned; otherwise the user gets empty roles and safe default privileges according to the repo's user model.

Disabled users and password-reset-locked users cannot log in through Google.

## Security behavior

- `state` and `nonce` are generated with cryptographically secure randomness.
- State is stored server-side with a short TTL and removed on callback.
- Callback failure messages are generic to users and detailed only in server logs without tokens or secrets.
- `hd` is used only as a Google UX hint. The verified email/domain claim is authoritative.
- Redirect targets are same-origin or app-relative only. External redirect values are rejected.
- CSRF behavior is preserved because Google SSO only uses GET redirects and then creates the same session cookie as existing auth.
- Logs and audit records include provider, username/email when safe, and reason category, but never code, access token, ID token, refresh token, or client secret.

## UI behavior

`htdocs/js/pages/Login.class.js` renders:

- Google button when `config.sso.enabled && config.sso.provider === "google"`.
- Username/password form when `config.sso.allow_local_login !== false`.
- A local admin fallback warning in documentation when operators disable local login.

The Google button navigates to `/api/app/google_sso_start` rather than calling an AJAX endpoint, so no token data enters browser storage.

## Tests

Add tests for:

- Public config redacts `client_secret` and exposes only safe SSO fields.
- Missing/invalid config is rejected before redirect.
- Callback rejects bad state.
- Callback rejects bad nonce.
- Callback rejects unverified email.
- Callback rejects disallowed domain.
- Callback rejects unknown user when `auto_provision=false`.
- Callback auto-provisions a user when enabled.
- Callback links an existing user by email.
- Callback matches an existing user by Google `sub`.
- Logging helpers do not include token or client secret material.

OIDC network interactions should be mocked or factored behind small helpers so tests do not call Google.

## Documentation

Add `docs/sso-google.md` or extend existing `docs/sso.md` with:

- Google Cloud Console Web Application OAuth client setup.
- Authorized redirect URI: `https://xyops.company.com/api/app/google_sso_callback`.
- Scopes: `openid email profile`.
- Example `SSO` config.
- `export XYOPS_GOOGLE_CLIENT_SECRET="..."` setup.
- Local development callback guidance.
- Warning that local login should remain enabled for emergency admin access unless the operator has another recovery path.

## Implementation scope

This change does not remove or replace the existing trusted-header SSO flow. Existing `SSO` behavior remains available when `SSO.provider` is unset or not `google`.
