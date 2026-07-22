# Google SSO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google OpenID Connect SSO under the existing PTOps `SSO` config while preserving local username/password login.

**Architecture:** Extend `lib/sso.js` with a Google provider path and factor common SSO session/user logic into helpers used by both trusted-header SSO and Google SSO. Add safe public config in `/api/app/config`, render a Google button in the existing login page, and test Google behavior through helper seams without calling Google.

**Tech Stack:** Node.js CommonJS, pixl-server-api, pixl-server-user, pixl-tools, pixl-request, `jose` for JWT/JWKS validation, pixl-unit tests.

---

## File Structure

- Modify `package.json`: add `jose` dependency for ID token validation.
- Modify `lib/engine.js`: allow app root to render normally when `SSO.provider === "google"`; keep trusted-header SSO behavior for existing configs.
- Modify `lib/api/config.js`: expose `config.sso` safe public subset only.
- Modify `lib/sso.js`: add Google start/callback API handlers, config helpers, discovery/token helpers, ID token validation, state/nonce storage, account mapping/provisioning, shared session creation helper, log redaction.
- Modify `htdocs/js/pages/Login.class.js`: render Google login button and optionally hide local form.
- Create `test/suites/test-sso-google.js`: unit/integration tests for config, state, callback validation, provisioning, linking, sub matching, and log redaction.
- Modify `test/test.js`: include `test-sso-google.js` after initial user setup.
- Modify `docs/sso.md`: add native Google SSO section.

---

### Task 1: Add Dependency and Public Config

**Files:**
- Modify: `package.json:35-81`
- Modify: `lib/api/config.js:32-58`
- Test: `test/suites/test-sso-google.js`
- Modify: `test/test.js:40-65`

- [ ] **Step 1: Write failing public config tests**

Create `test/suites/test-sso-google.js`:

```js
const assert = require('node:assert/strict');

exports.tests = [
	async function test_google_sso_public_config_redacts_secrets(test) {
		const oldSSO = this.xy.config.get('SSO');
		this.xy.config.set('SSO', {
			enabled: true,
			provider: 'google',
			client_id: 'client.apps.googleusercontent.com',
			client_secret: 'env:XYOPS_GOOGLE_CLIENT_SECRET',
			redirect_uri: 'http://localhost:6622/api/app/google_sso_callback',
			allowed_domains: ['company.com'],
			auto_provision: true,
			default_role: 'viewer',
			button_label: 'Sign in with Google',
			allow_local_login: true
		});
		process.env.XYOPS_GOOGLE_CLIENT_SECRET = 'super-secret-test-value';
		
		let { data } = await this.request.get(this.api_url + '/app/config');
		const raw = data.toString();
		assert.ok(raw.includes('app.receiveConfig('), 'expected JSONP config response');
		assert.ok(raw.includes('"sso"'), 'expected public sso config');
		assert.ok(raw.includes('"provider":"google"'), 'expected google provider');
		assert.ok(raw.includes('"button_label":"Sign in with Google"'), 'expected button label');
		assert.ok(!raw.includes('client_secret'), 'must not expose client_secret key');
		assert.ok(!raw.includes('super-secret-test-value'), 'must not expose secret value');
		assert.ok(!raw.includes('client.apps.googleusercontent.com'), 'must not expose client_id before login');
		
		this.xy.config.set('SSO', oldSSO);
		delete process.env.XYOPS_GOOGLE_CLIENT_SECRET;
	},
	
	async function test_google_sso_public_config_disabled_when_not_google(test) {
		const oldSSO = this.xy.config.get('SSO');
		this.xy.config.set('SSO', { enabled: true, header_map: { username: 'x-user', email: 'x-email' } });
		
		let { data } = await this.request.get(this.api_url + '/app/config');
		const raw = data.toString();
		assert.ok(!raw.includes('"sso"'), 'trusted-header SSO must not expose google UI config');
		
		this.xy.config.set('SSO', oldSSO);
	}
];
```

Modify `test/test.js` to load the new suite after `test-initial.js`:

```js
this.tests = this.tests.concat( 
	require('./suites/test-initial.js').tests,
	require('./suites/test-sso-google.js').tests,
	require('./suites/test-buckets.js').tests,
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- --grep google_sso_public_config
```

Expected: FAIL because `test/suites/test-sso-google.js` is new and `config.sso` is not exposed yet.

- [ ] **Step 3: Add `jose` dependency**

Modify `package.json` dependencies:

```json
"jose": "^5.10.0",
```

Place it near the other runtime dependencies, for example after `jexl`.

- [ ] **Step 4: Add safe public SSO config helper**

Modify `lib/sso.js` inside class `SSO`:

```js
	getPublicSSOConfig() {
		var sso = this.config.get('SSO') || {};
		if (!sso.enabled || (sso.provider !== 'google')) return null;
		
		return {
			enabled: true,
			provider: 'google',
			button_label: sso.button_label || 'Sign in with Google',
			allow_local_login: (sso.allow_local_login !== false)
		};
	}
```

- [ ] **Step 5: Expose public config**

Modify `lib/api/config.js` in `api_config()` after `resp.config = Tools.mergeHashes(...)`:

```js
				var public_sso = this.getPublicSSOConfig ? this.getPublicSSOConfig() : null;
				if (public_sso) resp.config.sso = public_sso;
```

Do not include `client_id`, `client_secret`, `redirect_uri`, or `allowed_domains`.

- [ ] **Step 6: Run tests and verify pass**

Run:

```bash
npm test -- --grep google_sso_public_config
```

Expected: PASS for both public config tests.

---

### Task 2: Keep Local App Root for Google Provider

**Files:**
- Modify: `lib/engine.js:185-192`
- Test: `test/suites/test-sso-google.js`

- [ ] **Step 1: Write failing root rendering test**

Append to `exports.tests` in `test/suites/test-sso-google.js`:

```js
	,
	async function test_google_sso_does_not_hijack_app_root(test) {
		const oldSSO = this.xy.config.get('SSO');
		this.xy.config.set('SSO', { enabled: true, provider: 'google' });
		
		let { resp, data } = await this.request.get(this.xy.config.get('base_app_url') + '/');
		assert.equal(resp.statusCode, 200, 'expected app root to render');
		assert.ok(data.toString().includes('/api/app/config'), 'expected index html bootstrap config');
		assert.ok(!data.toString().includes('Single Sign-On (SSO) Error'), 'must not run trusted-header SSO for google provider');
		
		this.xy.config.set('SSO', oldSSO);
	}
```

- [ ] **Step 2: Run test and verify failure**

Run:

```bash
npm test -- --grep google_sso_does_not_hijack_app_root
```

Expected: FAIL because `handleHome()` sends Google provider through trusted-header `handleSSO()`.

- [ ] **Step 3: Modify root routing**

Replace `lib/engine.js:185-192` with:

```js
	handleHome(args, callback) {
		// render home page
		var sso = this.config.get('SSO') || {};
		if (sso.enabled && (sso.provider !== 'google')) return this.handleSSO(args, callback);
		
		args.internalFile = Path.resolve('htdocs/index.html');
		args.internalTTL = 'private, max-age=0';
		return callback(false);
	}
```

- [ ] **Step 4: Run test and verify pass**

Run:

```bash
npm test -- --grep google_sso_does_not_hijack_app_root
```

Expected: PASS.

---

### Task 3: Add Google SSO Config, State, Discovery, and Start Route

**Files:**
- Modify: `lib/sso.js:5-14`, `lib/sso.js` class body
- Test: `test/suites/test-sso-google.js`

- [ ] **Step 1: Write failing config/state/start tests**

Append tests:

```js
	,
	async function test_google_sso_resolves_env_secret(test) {
		const oldSSO = this.xy.config.get('SSO');
		process.env.XYOPS_GOOGLE_CLIENT_SECRET = 'resolved-secret';
		this.xy.config.set('SSO', {
			enabled: true,
			provider: 'google',
			client_id: 'client.apps.googleusercontent.com',
			client_secret: 'env:XYOPS_GOOGLE_CLIENT_SECRET',
			redirect_uri: 'http://localhost:6622/api/app/google_sso_callback',
			allowed_domains: ['company.com']
		});
		
		const cfg = this.xy.getGoogleSSOConfig();
		assert.equal(cfg.client_secret, 'resolved-secret', 'expected secret from env');
		assert.deepEqual(cfg.allowed_domains, ['company.com'], 'expected allowed domains');
		
		this.xy.config.set('SSO', oldSSO);
		delete process.env.XYOPS_GOOGLE_CLIENT_SECRET;
	},
	
	async function test_google_sso_start_redirects_to_google(test) {
		const oldSSO = this.xy.config.get('SSO');
		process.env.XYOPS_GOOGLE_CLIENT_SECRET = 'resolved-secret';
		this.xy.config.set('SSO', {
			enabled: true,
			provider: 'google',
			client_id: 'client.apps.googleusercontent.com',
			client_secret: 'env:XYOPS_GOOGLE_CLIENT_SECRET',
			redirect_uri: 'http://localhost:6622/api/app/google_sso_callback',
			allowed_domains: ['company.com']
		});
		this.xy.googleSSODiscovery = {
			authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
			token_endpoint: 'https://oauth2.googleapis.com/token',
			jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs',
			issuer: 'https://accounts.google.com'
		};
		
		let { resp } = await this.request.get(this.api_url + '/app/google_sso_start');
		assert.equal(resp.statusCode, 302, 'expected redirect');
		assert.ok(resp.headers.location.startsWith('https://accounts.google.com/o/oauth2/v2/auth?'), 'expected google auth endpoint');
		assert.ok(resp.headers.location.includes('scope=openid+email+profile'), 'expected scopes');
		assert.ok(resp.headers.location.includes('client_id=client.apps.googleusercontent.com'), 'expected client id');
		assert.ok(resp.headers.location.includes('hd=company.com'), 'expected hd hint');
		assert.ok(resp.headers.location.includes('state='), 'expected state');
		assert.ok(resp.headers.location.includes('nonce='), 'expected nonce');
		
		this.xy.config.set('SSO', oldSSO);
		delete this.xy.googleSSODiscovery;
		delete process.env.XYOPS_GOOGLE_CLIENT_SECRET;
	}
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- --grep google_sso_resolves_env_secret
npm test -- --grep google_sso_start_redirects_to_google
```

Expected: FAIL because helpers/routes do not exist.

- [ ] **Step 3: Add imports**

At top of `lib/sso.js`, add:

```js
const crypto = require('crypto');
```

- [ ] **Step 4: Add config and state helpers**

Add to `lib/sso.js` class:

```js
	resolveSSOSecret(value) {
		if (!value) return '';
		value = '' + value;
		if (value.match(/^env\:([A-Za-z_][A-Za-z0-9_]*)$/)) return process.env[RegExp.$1] || '';
		return value;
	}
	
	getGoogleSSOConfig() {
		var sso = this.config.get('SSO') || {};
		if (!sso.enabled || (sso.provider !== 'google')) throw new Error('Google SSO is not enabled.');
		
		var cfg = {
			client_id: sso.client_id || '',
			client_secret: this.resolveSSOSecret(sso.client_secret),
			redirect_uri: sso.redirect_uri || ((this.config.get('base_app_url') || '').replace(/\/$/, '') + '/api/app/google_sso_callback'),
			allowed_domains: Array.isArray(sso.allowed_domains) ? sso.allowed_domains.map(function(domain) { return ('' + domain).toLowerCase(); }) : [],
			auto_provision: !!sso.auto_provision,
			default_role: sso.default_role || '',
			button_label: sso.button_label || 'Sign in with Google',
			allow_local_login: (sso.allow_local_login !== false),
			state_ttl: sso.state_ttl || 600
		};
		
		if (!cfg.client_id) throw new Error('Google SSO client_id is missing.');
		if (!cfg.client_secret) throw new Error('Google SSO client_secret is missing.');
		if (!cfg.redirect_uri.match(/^https?\:\/\//)) throw new Error('Google SSO redirect_uri is invalid.');
		if (!cfg.allowed_domains.length) throw new Error('Google SSO allowed_domains is missing.');
		
		return cfg;
	}
	
	generateGoogleSSOToken() {
		return crypto.randomBytes(32).toString('base64url');
	}
	
	getGoogleSSOStatePath(state) {
		return 'sessions/sso/google/' + state;
	}
```

- [ ] **Step 5: Add discovery helper**

Add to `lib/sso.js`:

```js
	getGoogleSSODiscovery(callback) {
		var self = this;
		if (this.googleSSODiscovery) return callback(null, this.googleSSODiscovery);
		
		this.request.get('https://accounts.google.com/.well-known/openid-configuration', { timeout: 10 * 1000 }, function(err, resp, data) {
			if (err) return callback(err);
			try {
				self.googleSSODiscovery = JSON.parse(data);
			}
			catch (e) {
				return callback(new Error('Failed to parse Google discovery document.'));
			}
			callback(null, self.googleSSODiscovery);
		});
	}
```

- [ ] **Step 6: Add start API route**

Add to `lib/sso.js`:

```js
	api_google_sso_start(args, callback) {
		var self = this;
		this.forceNoCacheResponse(args);
		if (!this.requireMaster(args, callback)) return;
		
		var cfg;
		try { cfg = this.getGoogleSSOConfig(); }
		catch (err) { return this.doSSOError('sso', 'Google SSO is not configured correctly.', callback); }
		
		this.getGoogleSSODiscovery(function(err, disco) {
			if (err) return self.doSSOError('sso', 'Google SSO is temporarily unavailable.', callback);
			
			var state = self.generateGoogleSSOToken();
			var nonce = self.generateGoogleSSOToken();
			var now = Tools.timeNow(true);
			var record = { state, nonce, created: now, expires: now + cfg.state_ttl };
			
			self.storage.put(self.getGoogleSSOStatePath(state), record, function(err) {
				if (err) return self.doSSOError('sso', 'Google SSO is temporarily unavailable.', callback);
				self.storage.expire(self.getGoogleSSOStatePath(state), record.expires);
				
				var params = new URLSearchParams({
					client_id: cfg.client_id,
					redirect_uri: cfg.redirect_uri,
					response_type: 'code',
					scope: 'openid email profile',
					state: state,
					nonce: nonce
				});
				if (cfg.allowed_domains.length === 1) params.set('hd', cfg.allowed_domains[0]);
				
				callback('302 Found', { Location: disco.authorization_endpoint + '?' + params.toString() }, '');
			});
		});
	}
```

- [ ] **Step 7: Run tests and verify pass**

Run:

```bash
npm test -- --grep google_sso_resolves_env_secret
npm test -- --grep google_sso_start_redirects_to_google
```

Expected: PASS.

---

### Task 4: Add Token Exchange and ID Token Validation Seams

**Files:**
- Modify: `lib/sso.js`
- Test: `test/suites/test-sso-google.js`

- [ ] **Step 1: Write failing validation tests**

Append tests:

```js
	,
	async function test_google_sso_rejects_unverified_email(test) {
		assert.throws(function() {
			this.xy.validateGoogleClaims({
				iss: 'https://accounts.google.com',
				aud: 'client.apps.googleusercontent.com',
				exp: Math.floor(Date.now() / 1000) + 60,
				nonce: 'nonce-1',
				email: 'user@company.com',
				email_verified: false,
				sub: 'sub-1'
			}, { issuer: 'https://accounts.google.com' }, { client_id: 'client.apps.googleusercontent.com', allowed_domains: ['company.com'] }, 'nonce-1');
		}.bind(this), /email is not verified/i);
	},
	
	async function test_google_sso_rejects_disallowed_domain(test) {
		assert.throws(function() {
			this.xy.validateGoogleClaims({
				iss: 'https://accounts.google.com',
				aud: 'client.apps.googleusercontent.com',
				exp: Math.floor(Date.now() / 1000) + 60,
				nonce: 'nonce-1',
				email: 'user@gmail.com',
				email_verified: true,
				sub: 'sub-1'
			}, { issuer: 'https://accounts.google.com' }, { client_id: 'client.apps.googleusercontent.com', allowed_domains: ['company.com'] }, 'nonce-1');
		}.bind(this), /domain is not allowed/i);
	},
	
	async function test_google_sso_rejects_bad_nonce(test) {
		assert.throws(function() {
			this.xy.validateGoogleClaims({
				iss: 'https://accounts.google.com',
				aud: 'client.apps.googleusercontent.com',
				exp: Math.floor(Date.now() / 1000) + 60,
				nonce: 'nonce-2',
				email: 'user@company.com',
				email_verified: true,
				sub: 'sub-1'
			}, { issuer: 'https://accounts.google.com' }, { client_id: 'client.apps.googleusercontent.com', allowed_domains: ['company.com'] }, 'nonce-1');
		}.bind(this), /nonce/i);
	}
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- --grep "google_sso_rejects_(unverified_email|disallowed_domain|bad_nonce)"
```

Expected: FAIL because `validateGoogleClaims()` does not exist.

- [ ] **Step 3: Add claim validation helper**

Add to `lib/sso.js`:

```js
	validateGoogleClaims(claims, disco, cfg, expected_nonce) {
		var now = Tools.timeNow(true);
		var issuer = disco.issuer || 'https://accounts.google.com';
		if ((claims.iss !== issuer) && (claims.iss !== 'accounts.google.com')) throw new Error('Google issuer is invalid.');
		if (claims.aud !== cfg.client_id) throw new Error('Google audience is invalid.');
		if (!claims.exp || (claims.exp <= now)) throw new Error('Google ID token is expired.');
		if (claims.nonce !== expected_nonce) throw new Error('Google nonce is invalid.');
		if (claims.email_verified !== true) throw new Error('Google email is not verified.');
		if (!claims.email || !claims.email.match(/^[^\@]+\@[^\@]+$/)) throw new Error('Google email is invalid.');
		if (!claims.sub) throw new Error('Google subject is missing.');
		
		var domain = claims.email.replace(/^.+\@/, '').toLowerCase();
		if (!cfg.allowed_domains.includes(domain)) throw new Error('Google email domain is not allowed.');
		
		return {
			sub: '' + claims.sub,
			email: claims.email.toLowerCase(),
			name: claims.name || '',
			picture: claims.picture || ''
		};
	}
```

- [ ] **Step 4: Add token exchange helper**

Add to `lib/sso.js`:

```js
	exchangeGoogleCode(code, cfg, disco, callback) {
		var body = new URLSearchParams({
			code: code,
			client_id: cfg.client_id,
			client_secret: cfg.client_secret,
			redirect_uri: cfg.redirect_uri,
			grant_type: 'authorization_code'
		}).toString();
		
		this.request.post(disco.token_endpoint, {
			timeout: 10 * 1000,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			data: body
		}, function(err, resp, data) {
			if (err) return callback(err);
			try { data = JSON.parse(data); }
			catch (e) { return callback(new Error('Failed to parse Google token response.')); }
			if (!data.id_token) return callback(new Error('Google token response is missing ID token.'));
			callback(null, data);
		});
	}
```

- [ ] **Step 5: Add ID token validation helper using `jose`**

Add to `lib/sso.js`:

```js
	validateGoogleIDToken(id_token, disco, cfg, expected_nonce, callback) {
		var self = this;
		import('jose').then(function(jose) {
			var JWKS = jose.createRemoteJWKSet(new URL(disco.jwks_uri));
			return jose.jwtVerify(id_token, JWKS, {
				issuer: disco.issuer || 'https://accounts.google.com',
				audience: cfg.client_id
			});
		}).then(function(result) {
			var user = self.validateGoogleClaims(result.payload, disco, cfg, expected_nonce);
			callback(null, user);
		}).catch(function(err) {
			callback(err);
		});
	}
```

- [ ] **Step 6: Run tests and verify pass**

Run:

```bash
npm test -- --grep "google_sso_rejects_(unverified_email|disallowed_domain|bad_nonce)"
```

Expected: PASS.

---

### Task 5: Add User Matching, Linking, and Provisioning

**Files:**
- Modify: `lib/sso.js`
- Test: `test/suites/test-sso-google.js`

- [ ] **Step 1: Write failing user mapping tests**

Append tests:

```js
	,
	async function test_google_sso_auto_provisions_user(test) {
		const oldSSO = this.xy.config.get('SSO');
		this.xy.config.set('SSO', { enabled: true, provider: 'google', auto_provision: true, default_role: '' });
		
		const claims = { sub: 'sub-auto-1', email: 'autosso@company.com', name: 'Auto SSO', picture: '' };
		await new Promise((resolve, reject) => {
			this.xy.findOrProvisionGoogleUser(claims, this.xy.config.get('SSO'), {}, function(err, user, is_new) {
				if (err) return reject(err);
				try {
					assert.ok(is_new, 'expected new user');
					assert.equal(user.username, 'autosso', 'expected username from email local-part');
					assert.equal(user.email, 'autosso@company.com', 'expected email');
					assert.equal(user.sso.google.sub, 'sub-auto-1', 'expected google sub');
					assert.ok(!user.privileges.admin, 'must not grant admin');
					resolve();
				}
				catch (e) { reject(e); }
			});
		});
		
		this.xy.config.set('SSO', oldSSO);
	},
	
	async function test_google_sso_links_existing_user_by_email(test) {
		const claims = { sub: 'sub-link-1', email: 'test@localhost', name: 'Linked Test', picture: '' };
		await new Promise((resolve, reject) => {
			this.xy.findOrProvisionGoogleUser(claims, { auto_provision: false }, {}, function(err, user, is_new) {
				if (err) return reject(err);
				try {
					assert.ok(!is_new, 'expected existing user');
					assert.equal(user.username, 'testuser', 'expected existing testuser');
					assert.equal(user.sso.google.sub, 'sub-link-1', 'expected google sub linked');
					resolve();
				}
				catch (e) { reject(e); }
			});
		});
	},
	
	async function test_google_sso_matches_existing_user_by_sub(test) {
		const path = 'users/' + this.xy.usermgr.normalizeUsername('testuser');
		const user = await new Promise((resolve, reject) => this.xy.storage.get(path, (err, user) => err ? reject(err) : resolve(user)));
		user.sso = { google: { sub: 'sub-existing-1' } };
		await new Promise((resolve, reject) => this.xy.storage.put(path, user, err => err ? reject(err) : resolve()));
		
		const claims = { sub: 'sub-existing-1', email: 'different@company.com', name: 'Existing Sub', picture: '' };
		await new Promise((resolve, reject) => {
			this.xy.findOrProvisionGoogleUser(claims, { auto_provision: false }, {}, function(err, found, is_new) {
				if (err) return reject(err);
				try {
					assert.ok(!is_new, 'expected existing user');
					assert.equal(found.username, 'testuser', 'expected sub match user');
					resolve();
				}
				catch (e) { reject(e); }
			});
		});
	}
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- --grep "google_sso_(auto_provisions|links_existing|matches_existing)"
```

Expected: FAIL because `findOrProvisionGoogleUser()` does not exist.

- [ ] **Step 3: Add user lookup helpers**

Add to `lib/sso.js`:

```js
	loadAllUsersForSSO(callback) {
		var self = this;
		this.storage.listGet('global/users', 0, 0, function(err, stubs) {
			if (err) return callback(err);
			var paths = (stubs || []).map(function(stub) { return 'users/' + self.usermgr.normalizeUsername(stub.username); });
			if (!paths.length) return callback(null, []);
			self.storage.getMulti(paths, callback);
		});
	}
	
	makeGoogleUsername(email) {
		return email.replace(/\@.+$/, '').replace(/[^\w\-\.]+/g, '').toLowerCase();
	}
```

- [ ] **Step 4: Add provisioning helper**

Add to `lib/sso.js`:

```js
	findOrProvisionGoogleUser(claims, cfg, args, callback) {
		var self = this;
		var email = claims.email.toLowerCase();
		this.loadAllUsersForSSO(function(err, users) {
			if (err) return callback(err);
			users = users || [];
			
			var user = users.find(function(item) {
				return item && item.sso && item.sso.google && (item.sso.google.sub === claims.sub);
			});
			if (user) return callback(null, user, false);
			
			user = users.find(function(item) {
				return item && item.email && (item.email.toLowerCase() === email);
			});
			if (user) {
				if (!user.active) return callback(new Error('User account is disabled.'));
				if (user.force_password_reset) return callback(new Error('User account is locked.'));
				if (!user.sso) user.sso = {};
				if (!user.sso.google) user.sso.google = {};
				user.sso.google.sub = claims.sub;
				user.remote = true;
				if (!('sync' in user)) user.sync = true;
				return callback(null, user, false);
			}
			
			if (!cfg.auto_provision) return callback(new Error('User account is not authorized.'));
			
			var base_username = self.makeGoogleUsername(email);
			if (!base_username || !base_username.match(self.usermgr.usernameMatch)) return callback(new Error('Google username is invalid.'));
			
			var username = base_username;
			var collision = users.find(function(item) { return item && (item.username === username); });
			if (collision && (!collision.email || (collision.email.toLowerCase() !== email))) username = base_username + '-' + crypto.createHash('sha256').update(email).digest('hex').substring(0, 8);
			if (!username.match(self.usermgr.usernameMatch)) return callback(new Error('Google username is invalid.'));
			if (users.find(function(item) { return item && (item.username === username); })) return callback(new Error('Google username collision.'));
			
			var roles = [];
			if (cfg.default_role && Tools.findObject(self.roles || [], { id: cfg.default_role })) roles.push(cfg.default_role);
			
			user = Tools.mergeHashes({
				username: username,
				full_name: claims.name || username,
				email: email,
				active: 1,
				remote: true,
				sync: true,
				created: Tools.timeNow(true),
				modified: Tools.timeNow(true),
				salt: Tools.generateUniqueID(64, username),
				password: Tools.generateUniqueID(64),
				privileges: {},
				roles: roles,
				sso: { google: { sub: claims.sub } }
			}, self.config.get('default_user_prefs'));
			
			callback(null, user, true);
		});
	}
```

- [ ] **Step 5: Run tests and verify pass**

Run:

```bash
npm test -- --grep "google_sso_(auto_provisions|links_existing|matches_existing)"
```

Expected: PASS.

---

### Task 6: Factor Shared Session Creation and Add Callback Route

**Files:**
- Modify: `lib/sso.js`
- Test: `test/suites/test-sso-google.js`

- [ ] **Step 1: Write failing callback tests**

Append tests:

```js
	,
	async function test_google_sso_callback_rejects_bad_state(test) {
		const oldSSO = this.xy.config.get('SSO');
		process.env.XYOPS_GOOGLE_CLIENT_SECRET = 'resolved-secret';
		this.xy.config.set('SSO', {
			enabled: true,
			provider: 'google',
			client_id: 'client.apps.googleusercontent.com',
			client_secret: 'env:XYOPS_GOOGLE_CLIENT_SECRET',
			redirect_uri: 'http://localhost:6622/api/app/google_sso_callback',
			allowed_domains: ['company.com']
		});
		
		let { data } = await this.request.get(this.api_url + '/app/google_sso_callback?code=abc&state=missing');
		assert.ok(data.toString().includes('Single Sign-On (SSO) Error'), 'expected SSO error page');
		
		this.xy.config.set('SSO', oldSSO);
		delete process.env.XYOPS_GOOGLE_CLIENT_SECRET;
	},
	
	async function test_google_sso_callback_creates_session(test) {
		const oldSSO = this.xy.config.get('SSO');
		process.env.XYOPS_GOOGLE_CLIENT_SECRET = 'resolved-secret';
		this.xy.config.set('SSO', {
			enabled: true,
			provider: 'google',
			client_id: 'client.apps.googleusercontent.com',
			client_secret: 'env:XYOPS_GOOGLE_CLIENT_SECRET',
			redirect_uri: 'http://localhost:6622/api/app/google_sso_callback',
			allowed_domains: ['company.com'],
			auto_provision: true
		});
		this.xy.googleSSODiscovery = { token_endpoint: 'mock-token', jwks_uri: 'mock-jwks', issuer: 'https://accounts.google.com' };
		this.xy.exchangeGoogleCode = function(code, cfg, disco, callback) { callback(null, { id_token: 'mock-id-token' }); };
		this.xy.validateGoogleIDToken = function(idToken, disco, cfg, nonce, callback) {
			callback(null, { sub: 'sub-session-1', email: 'sessionuser@company.com', name: 'Session User', picture: '' });
		};
		
		const state = 'state-session-1';
		await new Promise((resolve, reject) => this.xy.storage.put(this.xy.getGoogleSSOStatePath(state), {
			state: state,
			nonce: 'nonce-session-1',
			created: Math.floor(Date.now() / 1000),
			expires: Math.floor(Date.now() / 1000) + 600
		}, err => err ? reject(err) : resolve()));
		
		let { resp } = await this.request.get(this.api_url + '/app/google_sso_callback?code=abc&state=' + state);
		assert.equal(resp.statusCode, 302, 'expected app redirect');
		assert.ok(resp.headers['set-cookie'][0].match(/session_id=/), 'expected session cookie');
		
		this.xy.config.set('SSO', oldSSO);
		delete this.xy.googleSSODiscovery;
		delete this.xy.exchangeGoogleCode;
		delete this.xy.validateGoogleIDToken;
		delete process.env.XYOPS_GOOGLE_CLIENT_SECRET;
	}
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- --grep "google_sso_callback_(rejects_bad_state|creates_session)"
```

Expected: FAIL because callback route and shared session helper do not exist.

- [ ] **Step 3: Add shared session helper**

Add to `lib/sso.js`:

```js
	createSSOSession(args, user, new_user, callback) {
		var self = this;
		var usermgr = this.usermgr;
		var username = user.username;
		var path = 'users/' + usermgr.normalizeUsername(username);
		
		args.user = user;
		user.modified = Tools.timeNow(true);
		
		var finish = function() {
			self.storage.put(path, user, function(err) {
				if (err) return callback(err);
				if (new_user) {
					usermgr.logTransaction('user_create', username, self.getClientInfo(args, { user: Tools.copyHashRemoveKeys(user, { password: 1, salt: 1 }) }));
				}
				
				var now = Tools.timeNow(true);
				var exp_sec = 86400 * usermgr.config.get('session_expire_days');
				var expiration_date = Tools.normalizeTime(now + exp_sec, { hour: 0, min: 0, sec: 0 });
				var session_id = Tools.generateUniqueID(64, username);
				var session = {
					id: session_id,
					username: username,
					ip: args.ip,
					useragent: args.request.headers['user-agent'],
					created: now,
					modified: now,
					expires: expiration_date
				};
				if (self.usermgr.config.get('use_csrf')) session.csrf_token = Tools.generateUniqueID(64);
				
				self.storage.put('sessions/' + session_id, session, function(err) {
					if (err) return callback(err);
					args.session = session;
					self.storage.expire('sessions/' + session_id, expiration_date);
					args.setCookie('session_id', session_id, Tools.mergeHashes(usermgr.config.get('cookie_settings'), { maxAge: exp_sec }));
					usermgr.logTransaction('user_login', username, self.getClientInfo(args));
					usermgr.fireHook('after_login', args);
					
					if (new_user) {
						var insert = usermgr.config.get('sort_global_users') ? self.storage.listInsertSorted.bind(self.storage, 'global/users', { username: username }, ['username', 1]) : self.storage.listUnshift.bind(self.storage, 'global/users', { username: username });
						insert(function(err) {
							if (err) usermgr.logError(1, 'Failed to add user to global list: ' + err);
							usermgr.fireHook('after_create', args);
						});
					}
					else usermgr.fireHook('after_update', args);
					
					callback(null, session);
				});
			});
		};
		
		if (new_user) usermgr.fireHook('before_create', args, function(err) { if (err) return callback(err); finish(); });
		else usermgr.fireHook('before_update', args, function(err) { if (err) return callback(err); finish(); });
	}
```

- [ ] **Step 4: Add callback API route**

Add to `lib/sso.js`:

```js
	api_google_sso_callback(args, callback) {
		var self = this;
		this.forceNoCacheResponse(args);
		if (!this.requireMaster(args, callback)) return;
		
		var cfg;
		try { cfg = this.getGoogleSSOConfig(); }
		catch (err) { return this.doSSOError('sso', 'Google SSO is not configured correctly.', callback); }
		
		var code = args.query.code || '';
		var state = args.query.state || '';
		if (!code || !state || state.match(/[^A-Za-z0-9_\-]/)) return this.doSSOError('sso', 'Google SSO authentication failed.', callback);
		
		var state_path = this.getGoogleSSOStatePath(state);
		this.storage.get(state_path, function(err, record) {
			if (err || !record || (record.state !== state) || (record.expires <= Tools.timeNow(true))) {
				return self.doSSOError('sso', 'Google SSO authentication failed.', callback);
			}
			
			self.storage.delete(state_path, function() {});
			self.getGoogleSSODiscovery(function(err, disco) {
				if (err) return self.doSSOError('sso', 'Google SSO authentication failed.', callback);
				self.exchangeGoogleCode(code, cfg, disco, function(err, token_resp) {
					if (err) return self.doSSOError('sso', 'Google SSO authentication failed.', callback);
					self.validateGoogleIDToken(token_resp.id_token, disco, cfg, record.nonce, function(err, claims) {
						if (err) return self.doSSOError('sso', 'Google SSO authentication failed.', callback);
						self.findOrProvisionGoogleUser(claims, cfg, args, function(err, user, new_user) {
							if (err) return self.doSSOError('sso', 'Google SSO authentication failed.', callback);
							self.createSSOSession(args, user, new_user, function(err) {
								if (err) return self.doSSOError('sso', 'Google SSO authentication failed.', callback);
								callback('302 Found', { Location: self.config.get('base_app_url') || '/' }, '');
							});
						});
					});
				});
			});
		});
	}
```

- [ ] **Step 5: Run tests and verify pass**

Run:

```bash
npm test -- --grep "google_sso_callback_(rejects_bad_state|creates_session)"
```

Expected: PASS.

- [ ] **Step 6: Refactor trusted-header SSO session creation**

In `handleSSO()`, replace the duplicated session creation block after user preparation with `createSSOSession(args, user, new_user, callback)` preserving avatar import and group-role logic before the helper call.

Run:

```bash
npm test -- --grep "testAdminLogin|testUserLogin|google_sso_callback_creates_session"
```

Expected: PASS. Local login and Google session creation both still work.

---

### Task 7: Add Login UI Button and Local Login Toggle

**Files:**
- Modify: `htdocs/js/pages/Login.class.js:40-104`
- Test: Manual browser check after build

- [ ] **Step 1: Modify login HTML rendering**

In `htdocs/js/pages/Login.class.js`, wrap the existing local login form rows/buttons in:

```js
			var show_google_sso = config.sso && config.sso.enabled && (config.sso.provider == 'google');
			var show_local_login = !config.sso || (config.sso.allow_local_login !== false);
```

Render Google button before the local form:

```js
					if (show_google_sso) {
						html += '<div style="height:20px;"></div>';
						html += '<div class="button primary full_width" onClick="$P().doGoogleSSO()"><i class="mdi mdi-google">&nbsp;</i>' + encode_entities(config.sso.button_label || 'Sign in with Google') + '</div>';
						if (show_local_login) html += '<div style="height:20px; border-bottom:1px solid var(--border-color);"></div>';
					}
					
					if (show_local_login) {
						// existing username/password rows and buttons stay here
					}
					else {
						html += '<div class="caption" style="text-align:center; margin-top:20px;">Local login is disabled by SSO configuration.</div>';
					}
```

Add method to the class:

```js
	doGoogleSSO() {
		Dialog.showProgress(1.0, 'Redirecting to Google...');
		window.location.href = '/api/app/google_sso_start';
	}
```

Keep Enter key binding only when `show_local_login` is true:

```js
				if (show_local_login) {
					$('#fe_login_username, #fe_login_password').keypress(function(event) {
						if (event.keyCode == '13') {
							event.preventDefault();
							$P().doLogin();
						}
					});
				}
```

- [ ] **Step 2: Build dev assets**

Run:

```bash
node bin/build.js dev
```

Expected: command completes without syntax errors.

- [ ] **Step 3: Manual UI check**

Run local app with SSO enabled in `conf/overrides.json` and open login page:

```json
{
	"secret_key": "test",
	"SSO.enabled": true,
	"SSO.provider": "google",
	"SSO.client_id": "dummy.apps.googleusercontent.com",
	"SSO.client_secret": "env:XYOPS_GOOGLE_CLIENT_SECRET",
	"SSO.allowed_domains": ["company.com"],
	"SSO.allow_local_login": true
}
```

Expected: Login page shows both Google button and username/password form.

---

### Task 8: Add Documentation

**Files:**
- Modify: `docs/sso.md`

- [ ] **Step 1: Add Native Google SSO section near the OIDC plugin section**

Insert this section before `## PTOps OIDC Plugin`:

```md
## Native Google SSO

PTOps can perform a native Google OpenID Connect login flow for Google Workspace domains. This uses the existing PTOps session cookie after Google verifies the user identity.

### Google Cloud Console

1. Create an OAuth Client ID.
2. Choose **Web application**.
3. Add this Authorized redirect URI:

```text
https://xyops.company.com/api/app/google_sso_callback
```

4. Use scopes `openid email profile`.
5. Copy the Client ID and Client Secret.

### PTOps Configuration

Store the secret in the environment:

```bash
export XYOPS_GOOGLE_CLIENT_SECRET="..."
```

Configure `SSO`:

```json
{
	"enabled": true,
	"provider": "google",
	"client_id": "xxx.apps.googleusercontent.com",
	"client_secret": "env:XYOPS_GOOGLE_CLIENT_SECRET",
	"redirect_uri": "https://xyops.company.com/api/app/google_sso_callback",
	"allowed_domains": ["company.com"],
	"auto_provision": true,
	"default_role": "viewer",
	"button_label": "Sign in with Google",
	"allow_local_login": true
}
```

Keep `allow_local_login` enabled unless you have another emergency admin recovery path. Google `hd` is only a login hint; PTOps always checks the verified email domain after validating the ID token.

For local development, set `base_app_url` and `redirect_uri` to your local URL and add that exact callback URI to the Google OAuth client.
```

- [ ] **Step 2: Verify docs links render**

Run:

```bash
grep -n "Native Google SSO" docs/sso.md
```

Expected: section exists.

---

### Task 9: Full Verification

**Files:**
- Verify all modified files

- [ ] **Step 1: Install dependency**

Run:

```bash
npm install
```

Expected: succeeds and updates lockfile if present.

- [ ] **Step 2: Run targeted tests**

Run:

```bash
npm test -- --grep google_sso
```

Expected: all Google SSO tests pass.

- [ ] **Step 3: Run full test suite**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Build dev assets**

Run:

```bash
node bin/build.js dev
```

Expected: build completes.

- [ ] **Step 5: Check for leaked secrets/tokens in code/logging**

Run:

```bash
grep -RInE "id_token|access_token|refresh_token|client_secret" lib htdocs docs test/suites --include='*.js' --include='*.md'
```

Expected: token/secret strings appear only in config docs, test fixtures, request parsing, and redaction/validation code; no log statement prints raw token response or secret.

- [ ] **Step 6: Check working tree**

Run:

```bash
git status --short
```

Expected: only intended files are modified/untracked. Do not commit unless the user explicitly asks.

---

## Self-Review

Spec coverage:
- Google OIDC auth code flow: Tasks 3, 4, 6.
- Discovery document: Task 3.
- State/nonce TTL and single-use: Tasks 3, 6.
- ID token checks: Task 4.
- Domain restriction and `hd` hint: Tasks 3, 4.
- User provisioning/linking/sub match: Task 5.
- Public config and secret redaction: Task 1.
- UI button and local login fallback: Task 7.
- Audit/session reuse: Task 6.
- Tests and docs: Tasks 1-9.

No commits are included because the user explicitly said not to commit unless requested.
