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
	},

	async function test_google_sso_does_not_hijack_app_root(test) {
		const oldSSO = this.xy.config.get('SSO');
		this.xy.config.set('SSO', { enabled: true, provider: 'google' });

		let { resp, data } = await this.request.get(this.xy.config.get('base_app_url') + '/');
		assert.equal(resp.statusCode, 200, 'expected app root to render');
		assert.ok(data.toString().includes('/api/app/config'), 'expected index html bootstrap config');
		assert.ok(!data.toString().includes('Single Sign-On (SSO) Error'), 'must not run trusted-header SSO for google provider');

		this.xy.config.set('SSO', oldSSO);
	},

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
	},

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
	},

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
		const path = 'users/' + this.xy.usermgr.normalizeUsername('testuser');
		const user = await new Promise((resolve, reject) => this.xy.storage.get(path, (err, user) => err ? reject(err) : resolve(user)));
		const oldSSO = user.sso;

		try {
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
		}
		finally {
			if (oldSSO) user.sso = oldSSO;
			else delete user.sso;
			await new Promise((resolve, reject) => this.xy.storage.put(path, user, err => err ? reject(err) : resolve()));
		}
	},

	async function test_google_sso_matches_existing_user_by_sub(test) {
		const path = 'users/' + this.xy.usermgr.normalizeUsername('testuser');
		const user = await new Promise((resolve, reject) => this.xy.storage.get(path, (err, user) => err ? reject(err) : resolve(user)));
		const oldSSO = user.sso;
		user.sso = { google: { sub: 'sub-existing-1' } };
		await new Promise((resolve, reject) => this.xy.storage.put(path, user, err => err ? reject(err) : resolve()));

		try {
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
		finally {
			if (oldSSO) user.sso = oldSSO;
			else delete user.sso;
			await new Promise((resolve, reject) => this.xy.storage.put(path, user, err => err ? reject(err) : resolve()));
		}
	},

	async function test_google_sso_rejects_disabled_sub_user(test) {
		const path = 'users/' + this.xy.usermgr.normalizeUsername('testuser');
		const user = await new Promise((resolve, reject) => this.xy.storage.get(path, (err, user) => err ? reject(err) : resolve(user)));
		const oldActive = user.active;
		const oldSSO = user.sso;

		user.sso = { google: { sub: 'sub-disabled' } };
		user.active = 0;
		await new Promise((resolve, reject) => this.xy.storage.put(path, user, err => err ? reject(err) : resolve()));

		try {
			await assert.rejects(new Promise((resolve, reject) => {
				this.xy.findOrProvisionGoogleUser({ sub: 'sub-disabled', email: 'other@company.com', name: 'Disabled', picture: '' }, { auto_provision: false }, {}, function(err) {
					if (err) reject(err);
					else resolve();
				});
			}), /disabled/i);
		}
		finally {
			user.active = oldActive;
			if (oldSSO) user.sso = oldSSO;
			else delete user.sso;
			await new Promise((resolve, reject) => this.xy.storage.put(path, user, err => err ? reject(err) : resolve()));
		}
	},

	async function test_google_sso_rejects_locked_sub_user(test) {
		const path = 'users/' + this.xy.usermgr.normalizeUsername('testuser');
		const user = await new Promise((resolve, reject) => this.xy.storage.get(path, (err, user) => err ? reject(err) : resolve(user)));
		const oldForcePasswordReset = user.force_password_reset;
		const oldSSO = user.sso;

		user.sso = { google: { sub: 'sub-locked' } };
		user.force_password_reset = 1;
		await new Promise((resolve, reject) => this.xy.storage.put(path, user, err => err ? reject(err) : resolve()));

		try {
			await assert.rejects(new Promise((resolve, reject) => {
				this.xy.findOrProvisionGoogleUser({ sub: 'sub-locked', email: 'other@company.com', name: 'Locked', picture: '' }, { auto_provision: false }, {}, function(err) {
					if (err) reject(err);
					else resolve();
				});
			}), /locked/i);
		}
		finally {
			if (oldForcePasswordReset) user.force_password_reset = oldForcePasswordReset;
			else delete user.force_password_reset;
			if (oldSSO) user.sso = oldSSO;
			else delete user.sso;
			await new Promise((resolve, reject) => this.xy.storage.put(path, user, err => err ? reject(err) : resolve()));
		}
	},

	async function test_google_sso_provisioning_uses_safe_defaults(test) {
		const oldPrefs = this.xy.config.get('default_user_prefs');
		const oldRoles = this.xy.roles;
		this.xy.config.set('default_user_prefs', { privileges: { admin: 1 }, roles: ['admin-role'], active: 0, sso: { google: { sub: 'bad' } } });
		this.xy.roles = [{ id: 'admin-role', privileges: { admin: 1 } }];

		try {
			const claims = { sub: 'sub-safe-defaults', email: 'safe-defaults@company.com', name: 'Safe Defaults', picture: '' };
			await new Promise((resolve, reject) => {
				this.xy.findOrProvisionGoogleUser(claims, { auto_provision: true, default_role: 'admin-role' }, {}, function(err, user) {
					if (err) return reject(err);
					try {
						assert.equal(user.active, 1, 'expected active user');
						assert.deepEqual(user.privileges, {}, 'must not inherit admin privileges from prefs');
						assert.deepEqual(user.roles, [], 'must not assign admin default role');
						assert.equal(user.sso.google.sub, 'sub-safe-defaults', 'must use Google sub from claims');
						resolve();
					}
					catch (e) { reject(e); }
				});
			});
		}
		finally {
			this.xy.config.set('default_user_prefs', oldPrefs);
			this.xy.roles = oldRoles;
		}
	},

	async function test_google_sso_normalized_username_collision_gets_suffix(test) {
		const claims = { sub: 'sub-collision-1', email: 'test.user@company.com', name: 'Collision User', picture: '' };
		await new Promise((resolve, reject) => {
			this.xy.findOrProvisionGoogleUser(claims, { auto_provision: true, default_role: '' }, {}, function(err, user, is_new) {
				if (err) return reject(err);
				try {
					assert.ok(is_new, 'expected new user');
					assert.ok(user.username.startsWith('test.user-'), 'expected deterministic collision suffix');
					assert.notEqual(user.username, 'test.user', 'must not collide with normalized testuser path');
					resolve();
				}
				catch (e) { reject(e); }
			});
		});
	},

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
		this.xy.googleSSODiscovery = { token_endpoint: 'https://oauth2.googleapis.com/token', jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs', issuer: 'https://accounts.google.com' };
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

		try {
			let { resp } = await this.request.get(this.api_url + '/app/google_sso_callback?code=abc&state=' + state);
			assert.equal(resp.statusCode, 302, 'expected app redirect');
			assert.ok(resp.headers['set-cookie'][0].match(/session_id=/), 'expected session cookie');
		}
		finally {
			this.xy.config.set('SSO', oldSSO);
			delete this.xy.googleSSODiscovery;
			delete this.xy.exchangeGoogleCode;
			delete this.xy.validateGoogleIDToken;
			delete process.env.XYOPS_GOOGLE_CLIENT_SECRET;
		}
	},

	async function test_google_sso_callback_preserves_safe_provisioning_defaults(test) {
		const oldSSO = this.xy.config.get('SSO');
		const oldPrefs = this.xy.config.get('default_user_prefs');
		const oldExchangeGoogleCode = this.xy.exchangeGoogleCode;
		const oldValidateGoogleIDToken = this.xy.validateGoogleIDToken;
		const oldCreateSSOSession = this.xy.createSSOSession;
		let provisionedUser = null;
		process.env.XYOPS_GOOGLE_CLIENT_SECRET = 'resolved-secret';
		this.xy.config.set('default_user_prefs', { privileges: { admin: 1 }, roles: ['admin-role'], active: 0, sso: { google: { sub: 'bad' } } });
		this.xy.config.set('SSO', {
			enabled: true,
			provider: 'google',
			client_id: 'client.apps.googleusercontent.com',
			client_secret: 'env:XYOPS_GOOGLE_CLIENT_SECRET',
			redirect_uri: 'http://localhost:6622/api/app/google_sso_callback',
			allowed_domains: ['company.com'],
			auto_provision: true
		});
		this.xy.googleSSODiscovery = { token_endpoint: 'https://oauth2.googleapis.com/token', jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs', issuer: 'https://accounts.google.com' };
		this.xy.exchangeGoogleCode = function(code, cfg, disco, callback) { callback(null, { id_token: 'mock-id-token' }); };
		this.xy.validateGoogleIDToken = function(idToken, disco, cfg, nonce, callback) {
			callback(null, { sub: 'sub-safe-callback', email: 'safe-callback@company.com', name: 'Safe Callback', picture: '' });
		};
		this.xy.createSSOSession = oldCreateSSOSession.bind(this.xy);

		const state = 'state-safe-callback';
		await new Promise((resolve, reject) => this.xy.storage.put(this.xy.getGoogleSSOStatePath(state), {
			state: state,
			nonce: 'nonce-safe-callback',
			created: Math.floor(Date.now() / 1000),
			expires: Math.floor(Date.now() / 1000) + 600
		}, err => err ? reject(err) : resolve()));

		try {
			let { resp } = await this.request.get(this.api_url + '/app/google_sso_callback?code=abc&state=' + state);
			assert.equal(resp.statusCode, 302, 'expected app redirect');
			provisionedUser = await new Promise((resolve, reject) => this.xy.storage.get('users/' + this.xy.usermgr.normalizeUsername('safe-callback'), (err, user) => err ? reject(err) : resolve(user)));
			assert.equal(provisionedUser.active, 1, 'must not inherit disabled state');
			assert.deepEqual(provisionedUser.privileges, {}, 'must not inherit admin privileges');
			assert.deepEqual(provisionedUser.roles, [], 'must not inherit admin roles');
			assert.equal(provisionedUser.sso.google.sub, 'sub-safe-callback', 'must preserve Google subject');
			assert.ok(!provisionedUser._google_sso_safe_defaults, 'must not persist internal marker');
		}
		finally {
			await new Promise((resolve) => this.xy.storage.delete('users/' + this.xy.usermgr.normalizeUsername('safe-callback'), resolve));
			await new Promise((resolve) => this.xy.storage.listFindDelete('global/users', { username: 'safe-callback' }, resolve));
			this.xy.config.set('SSO', oldSSO);
			this.xy.config.set('default_user_prefs', oldPrefs);
			delete this.xy.googleSSODiscovery;
			this.xy.exchangeGoogleCode = oldExchangeGoogleCode;
			this.xy.validateGoogleIDToken = oldValidateGoogleIDToken;
			this.xy.createSSOSession = oldCreateSSOSession;
			delete process.env.XYOPS_GOOGLE_CLIENT_SECRET;
		}
	},

	async function test_google_sso_callback_consumes_state_once(test) {
		const oldSSO = this.xy.config.get('SSO');
		const oldExchangeGoogleCode = this.xy.exchangeGoogleCode;
		const oldValidateGoogleIDToken = this.xy.validateGoogleIDToken;
		const oldFindOrProvisionGoogleUser = this.xy.findOrProvisionGoogleUser;
		const oldCreateSSOSession = this.xy.createSSOSession;
		let exchangeCount = 0;
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
		this.xy.googleSSODiscovery = { token_endpoint: 'https://oauth2.googleapis.com/token', jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs', issuer: 'https://accounts.google.com' };
		this.xy.exchangeGoogleCode = function(code, cfg, disco, callback) { exchangeCount++; callback(null, { id_token: 'mock-id-token' }); };
		this.xy.validateGoogleIDToken = function(idToken, disco, cfg, nonce, callback) {
			callback(null, { sub: 'sub-once-1', email: 'once@company.com', name: 'Once User', picture: '' });
		};
		this.xy.findOrProvisionGoogleUser = function(claims, cfg, args, callback) {
			callback(null, { username: 'testuser', active: 1, privileges: {}, roles: [] }, false);
		};
		this.xy.createSSOSession = function(args, user, isNew, callback) { callback(null, { id: 'mock-session' }); };

		const state = 'state-once-1';
		await new Promise((resolve, reject) => this.xy.storage.put(this.xy.getGoogleSSOStatePath(state), {
			state: state,
			nonce: 'nonce-once-1',
			created: Math.floor(Date.now() / 1000),
			expires: Math.floor(Date.now() / 1000) + 600
		}, err => err ? reject(err) : resolve()));

		try {
			let first = await this.request.get(this.api_url + '/app/google_sso_callback?code=abc&state=' + state);
			assert.equal(first.resp.statusCode, 302, 'expected first callback to redirect');
			let second = await this.request.get(this.api_url + '/app/google_sso_callback?code=abc&state=' + state);
			assert.ok(second.data.toString().includes('Single Sign-On (SSO) Error'), 'expected replay to fail');
			assert.equal(exchangeCount, 1, 'state replay must not reach token exchange');
		}
		finally {
			this.xy.config.set('SSO', oldSSO);
			delete this.xy.googleSSODiscovery;
			this.xy.exchangeGoogleCode = oldExchangeGoogleCode;
			this.xy.validateGoogleIDToken = oldValidateGoogleIDToken;
			this.xy.findOrProvisionGoogleUser = oldFindOrProvisionGoogleUser;
			this.xy.createSSOSession = oldCreateSSOSession;
			delete process.env.XYOPS_GOOGLE_CLIENT_SECRET;
		}
	}
];
