// xyOps Single Sign-On (SSO) Layer
// Copyright (c) 2019 - 2026 PixlCore LLC
// Released under the BSD 3-Clause License.
// See the LICENSE.md file in this repository.

const fs = require('fs');
const Path = require('path');
const os = require('os');
const cp = require('child_process');
const crypto = require('crypto');
const async = require("async");
const Tools = require("pixl-tools");
const ACL = require('pixl-acl');
const noop = function() {};

class SSO {
	
	/* {
		"enabled": true,
		"hybrid": false,
		"whitelist": ["127.0.0.1", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "::1/128", "fd00::/8", "169.254.0.0/16", "fe80::/10"],
		"header_map": {
			"username": "x-forwarded-user",
			"full_name": "x-forwarded-user",
			"email": "x-forwarded-email",
			"groups": "x-forwarded-groups"
		},
		"cleanup_username": true,
		"cleanup_full_name": true,
		"group_role_map": {
			"pixlcore:owners": []
		},
		"group_privilege_map": {
			"pixlcore:owners": ["admin"]
		},
		"replace_roles": false,
		"replace_privileges": false,
		"logout_url": "/oauth2/sign_out?rd=https%3A%2F%2Fgoogle.com%2F"
	}*/
	
	ssoSetup() {
		// setup SSO subsystem
		var sso = this.config.get('SSO');
		if (!sso || !sso.enabled) return;
		
		this.ssoPresets = {
			tailscale: {
				"header_map": {
					"username": "Tailscale-User-Login",
					"full_name": "Tailscale-User-Name",
					"email": "Tailscale-User-Login",
					"avatar": "Tailscale-User-Profile-Pic",
					"groups": "Tailscale-App-Capabilities"
				},
				"logout_url": "/api/app/sso_logout"
			}
		};
		
		this.logSSO(3, "SSO is enabled");
		
		if (sso.whitelist) {
			// accept CSV string or array
			var whitelist = (typeof(sso.whitelist) == 'string') ? sso.whitelist.split(/\,\s*/) : sso.whitelist;
			this.ssoWhitelist = new ACL( whitelist );
		}
	}

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

	resolveSSOSecret(value) {
		if (!value) return '';
		value = '' + value;
		if (value.match(/^env\:([A-Za-z_][A-Za-z0-9_]*)$/)) return process.env[RegExp.$1] || '';
		return value;
	}

	getGoogleSSOConfig() {
		var sso = this.config.get('SSO') || {};
		if (!sso.enabled || (sso.provider !== 'google')) throw new Error('Google SSO is not enabled.');

		var allowed_domains = Array.isArray(sso.allowed_domains) ? sso.allowed_domains.map(function(domain) { return ('' + domain).trim().toLowerCase(); }) : [];
		if (allowed_domains.some(function(domain) { return !domain || !domain.match(/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/); })) throw new Error('Google SSO allowed_domains is invalid.');

		var state_ttl = sso.state_ttl || 600;
		if ((typeof(state_ttl) === 'string') && state_ttl.match(/^\d+$/)) state_ttl = parseInt(state_ttl, 10);
		if ((typeof(state_ttl) !== 'number') || !isFinite(state_ttl) || (Math.floor(state_ttl) !== state_ttl) || (state_ttl < 60) || (state_ttl > 3600)) throw new Error('Google SSO state_ttl is invalid.');

		var cfg = {
			client_id: sso.client_id || '',
			client_secret: this.resolveSSOSecret(sso.client_secret),
			redirect_uri: sso.redirect_uri || ((this.config.get('base_app_url') || '').replace(/\/$/, '') + '/api/app/google_sso_callback'),
			allowed_domains: allowed_domains,
			auto_provision: !!sso.auto_provision,
			default_role: sso.default_role || '',
			button_label: sso.button_label || 'Sign in with Google',
			allow_local_login: (sso.allow_local_login !== false),
			state_ttl: state_ttl
		};

		if (!cfg.client_id) throw new Error('Google SSO client_id is missing.');
		if (!cfg.client_secret) throw new Error('Google SSO client_secret is missing.');
		try {
			var redirect_url = new URL(cfg.redirect_uri);
			if (!redirect_url.hostname || !redirect_url.protocol.match(/^https?\:$/)) throw new Error();
		}
		catch (err) {
			throw new Error('Google SSO redirect_uri is invalid.');
		}
		if (!cfg.allowed_domains.length) throw new Error('Google SSO allowed_domains is missing.');

		return cfg;
	}

	generateGoogleSSOToken() {
		return crypto.randomBytes(32).toString('base64url');
	}

	getGoogleSSOStatePath(state) {
		return 'sessions/sso/google/' + state;
	}

	getGoogleSSODiscovery(callback) {
		var self = this;
		if (this.googleSSODiscovery) return callback(null, this.googleSSODiscovery);

		this.request.get('https://accounts.google.com/.well-known/openid-configuration', { timeout: 10 * 1000 }, function(err, resp, data) {
			if (err) return callback(err);
			if (!resp || (resp.statusCode < 200) || (resp.statusCode >= 300)) return callback(new Error('Google discovery request failed.'));

			var disco = null;
			try {
				disco = JSON.parse(data);
			}
			catch (e) {
				return callback(new Error('Failed to parse Google discovery document.'));
			}

			try {
				['authorization_endpoint', 'token_endpoint', 'jwks_uri'].forEach(function(key) {
					var url = new URL(disco[key]);
					if (url.protocol !== 'https:') throw new Error();
				});
				if (disco.issuer !== 'https://accounts.google.com') throw new Error();
			}
			catch (e) {
				return callback(new Error('Google discovery document is invalid.'));
			}

			self.googleSSODiscovery = disco;
			callback(null, self.googleSSODiscovery);
		});
	}

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

	findOrProvisionGoogleUser(claims, cfg, args, callback) {
		var self = this;
		var email = claims.email.toLowerCase();
		this.loadAllUsersForSSO(function(err, users) {
			if (err) return callback(err);
			users = users || [];

			var checkExistingUser = function(user) {
				if (!user.active) throw new Error('User account is disabled.');
				if (user.force_password_reset) throw new Error('User account is locked.');
			};

			var user = users.find(function(item) {
				return item && item.sso && item.sso.google && (item.sso.google.sub === claims.sub);
			});
			if (user) {
				try { checkExistingUser(user); }
				catch (err) { return callback(err); }
				return callback(null, user, false);
			}

			user = users.find(function(item) {
				return item && item.email && (item.email.toLowerCase() === email);
			});
			if (user) {
				try { checkExistingUser(user); }
				catch (err) { return callback(err); }
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
			var usernamePathExists = function(username) {
				var normalized = self.usermgr.normalizeUsername(username);
				return users.find(function(item) { return item && (self.usermgr.normalizeUsername(item.username) === normalized); });
			};
			var collision = usernamePathExists(username);
			if (collision && (!collision.email || (collision.email.toLowerCase() !== email))) username = base_username + '-' + crypto.createHash('sha256').update(email).digest('hex').substring(0, 8);
			if (!username.match(self.usermgr.usernameMatch)) return callback(new Error('Google username is invalid.'));
			if (usernamePathExists(username)) return callback(new Error('Google username collision.'));

			var roles = [];
			if (cfg.default_role) {
				var role = Tools.findObject(self.roles || [], { id: cfg.default_role });
				if (role && !(role.privileges && role.privileges.admin)) roles.push(cfg.default_role);
			}

			user = Tools.mergeHashes(self.config.get('default_user_prefs'), {
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
				sso: { google: { sub: claims.sub } },
				_google_sso_safe_defaults: { privileges: {}, roles: roles, sso: { google: { sub: claims.sub } } }
			});

			callback(null, user, true);
		});
	}

	createSSOSession(args, user, new_user, callback, after_before_hook) {
		var self = this;
		var usermgr = this.usermgr;
		var username = user.username;
		var path = 'users/' + usermgr.normalizeUsername(username);

		args.user = user;
		user.modified = Tools.timeNow(true);

		var finish = function() {
			if (user._google_sso_safe_defaults) {
				user.active = 1;
				user.privileges = user._google_sso_safe_defaults.privileges;
				user.roles = user._google_sso_safe_defaults.roles;
				user.sso = user._google_sso_safe_defaults.sso;
				delete user._google_sso_safe_defaults;
			}

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

					callback(null, session);

					usermgr.fireHook('after_login', args);
					if (new_user) {
						var insert = usermgr.config.get('sort_global_users') ? self.storage.listInsertSorted.bind(self.storage, 'global/users', { username: username }, ['username', 1]) : self.storage.listUnshift.bind(self.storage, 'global/users', { username: username });
						insert(function(err) {
							if (err) usermgr.logError(1, 'Failed to add user to global list: ' + err);
							usermgr.fireHook('after_create', args);
						});
					}
					else usermgr.fireHook('after_update', args);
				});
			});
		};

		var afterBeforeHook = function() {
			if (after_before_hook) return after_before_hook(finish);
			finish();
		};

		if (new_user) usermgr.fireHook('before_create', args, function(err) { if (err) return callback(err); afterBeforeHook(); });
		else usermgr.fireHook('before_update', args, function(err) { if (err) return callback(err); afterBeforeHook(); });
	}

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

	logSSO(level, msg, data) {
		// log debug msg with pseudo-component
		if (this.debugLevel(level)) {
			this.logger.set( 'component', 'SSO' );
			this.logger.print({ category: 'debug', code: level, msg: msg, data: data });
		}
	}
	
	doSSOError(code, description, callback) {
		// handle SSO error by displaying full page error
		var title = "Single Sign-On (SSO) Error";
		this.api.logError( code, description );
		
		// inject error into bootstrap loader, which bubbles up to a full page error
		fs.readFile( 'htdocs/index.html', 'utf8', function(err, body) {
			body = body.replace( '<script src="/api/app/config"></script>', function() {
				return `<script src="/api/app/config?code=${encodeURIComponent(code)}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}"></script>`;
			} );
			
			callback( "200 OK", { 'Content-Type': "text/html" }, body );
		} ); // fs.readFile
		
		return false;
	}
	
	handleSSO(args, callback) {
		// handle SSO request early, called from handleHome
		var self = this;
		var usermgr = this.usermgr;
		var sso = this.config.get('SSO');
		
		// merge in preset if applicable
		if (sso.preset && this.ssoPresets[sso.preset]) {
			sso = Tools.mergeHashes( sso, this.ssoPresets[sso.preset] );
		}
		
		this.forceNoCacheResponse(args);
		
		if (this.ssoWhitelist && !this.ssoWhitelist.check(args.request.socket.remoteAddress)) {
			this.logSSO(1, "Disallowing request from IP: " + args.request.socket.remoteAddress + " (not in whitelist)");
			return this.doSSOError('sso', "SSO Auth Flow Failure: IP address is not allowed.", callback);
		}
		
		if (!this.master) {
			return self.doSSOError('sso', "Server is not a primary conductor.", callback);
		}
		
		// see if user already has a valid session
		this.loadSession( args, function(err, session, user) {
			if (session && user) {
				// already logged in
				self.logSSO(7, "User is already logged in: " + user.username);
				args.internalFile = Path.resolve('htdocs/index.html');
				args.internalTTL = 'private, max-age=0';
				return callback(false); // passthru
			}
			
			// custom sso plugin command
			if (sso.command && !args._sso_command_response) {
				return self.execSSOCommand(args, callback);
			}
			
			self.logSSO(5, "Starting SSO auth flow", { uri: args.request.url, headers: self.debug ? args.request.headers : undefined });
			
			// are the magic headers present?
			var external_user = {};
			var header_map = sso.header_map;
			if (!header_map) {
				// no header map provided
				return self.doSSOError('sso', "SSO Auth Flow Failure: No header map provided.", callback);
			}
			
			// convert headers to standard keys we understand
			for (var key in header_map) {
				external_user[key] = args.request.headers[ header_map[key].toLowerCase() ] || '';
			}
			
			if (!external_user.username || !external_user.email) {
				// required bits not present
				if (sso.hybrid) {
					// allow non-SSO mode when magic headers not present
					self.logSSO(7, "SSO headers not found, falling back to local auth.");
					args.internalFile = Path.resolve('htdocs/index.html');
					args.internalTTL = 'private, max-age=0';
					return callback(false);
				}
				else return self.doSSOError('sso', "SSO Auth Flow Failure: Required headers not present.", callback);
			}
			
			// cleanup / massage fields
			var username = sso.cleanup_username ? 
				external_user.username.replace(/\@.+$/, '').replace(/[^\w\-\.]+/g, '').toLowerCase() : 
				external_user.username.replace(/[^\w\-\.]+/g, '_').toLowerCase();
			
			if (!external_user.full_name) external_user.full_name = username;
			if (sso.cleanup_full_name) {
				// also cleanup full name (i.e. set to email field)
				external_user.full_name = self.toTitleCase( external_user.full_name.replace(/\@.+$/, '').replace(/\./g, ' ') );
			}
			
			self.logSSO(9, "Got external user via trusted headers: " + username, external_user );
			
			if (!username.match(usermgr.usernameMatch)) {
				return self.doSSOError('sso', "Username contains illegal characters: " + username, callback);
			}
			
			// user found in response!  update our records and create a local session
			var path = 'users/' + usermgr.normalizeUsername(username);
			
			self.logSSO(8, "Testing if user exists: " + path, { username });
			
			self.storage.get(path, function(err, user) {
				var new_user = false;
				if (!user) {
					// first time, create new user
					self.logSSO(6, "Creating new user: " + username);
					new_user = true;
					user = Tools.mergeHashes( {
						username: username,
						active: 1,
						remote: true,
						sync: true,
						created: Tools.timeNow(true),
						modified: Tools.timeNow(true),
						salt: Tools.generateUniqueID( 64, username ),
						password: Tools.generateUniqueID(64), // unused
						privileges: self.getDefaultUserPrivileges(),
						roles: []
					}, self.config.get('default_user_prefs') );
				} // new user
				else {
					self.logSSO(7, "User already exists: " + username);
					if (user.force_password_reset) {
						return self.doSSOError('login', "Sorry, your account is locked out.  Please contact your system administrator.", callback);
					}
					if (!user.active) {
						return self.doSSOError('login', "Sorry, your user account is disabled.  Please contact your system administrator.", callback);
					}
					user.remote = true;
					if (!('sync' in user)) user.sync = true;
				}
				
				// copy to args for logging
				args.user = user;
				
				var finish = function() {
					// sync user info
					if (user.sync) {
						user.full_name = external_user.full_name;
						user.email = external_user.email;
					}
					
					/* "group_role_map": {
						"pixlcore:owners": []
					},
					"group_privilege_map": {
						"pixlcore:owners": ["admin"]
					} */
					
					// apply roles and privs to user record
					if (header_map.groups) {
						var raw_groups = [];
						
						// support ts-app-cap json header format, and also simple delimited
						if (external_user.groups && String(external_user.groups).trim().match(/^\{[\S\s]+\}$/)) {
							// "tailscale-app-capabilities": "{\"xyops.io/cap/ts\":[{\"privileges\":[\"admin\"],\"roles\":[]}]}",
							try {
								var ts_json = JSON.parse( external_user.groups );
								var ts_cap_id = sso.ts_cap_id || 'xyops.io/cap/ts';
								
								if (ts_json[ts_cap_id] && Array.isArray(ts_json[ts_cap_id])) {
									if (sso.replace_roles) user.roles = [];
									if (sso.replace_privileges) user.privileges = {};
									
									ts_json[ts_cap_id].forEach( function(cap) {
										if (cap.groups && Array.isArray(cap.groups)) raw_groups = raw_groups.concat( cap.groups );
										if (cap.privileges && Array.isArray(cap.privileges)) cap.privileges.forEach( function(priv) { user.privileges[priv] = 1; } );
										if (cap.roles && Array.isArray(cap.roles)) user.roles = user.roles.concat( cap.roles );
									} );
									
									// remove dupes
									user.roles = [ ...new Set(user.roles) ];
									
									self.logSSO(9, "User privileges/roles were auto-set by: " + ts_cap_id, {
										capabilities: ts_json,
										privileges: user.privileges,
										roles: user.roles
									});
								}
							}
							catch (e) {
								self.logSSO(5, "Warning: Failed to parse JSON in group header: " + e);
							}
						}
						else {
							// simple delimited group format
							raw_groups = external_user.groups ? external_user.groups.split( sso.group_role_separator || ',' ) : [];
						}
						
						if (sso.group_role_map) {
							if (sso.replace_roles) user.roles = [];
							
							raw_groups.forEach( function(raw_group) {
								if (!sso.group_role_map[raw_group]) return;
								user.roles = user.roles.concat( sso.group_role_map[raw_group] );
							} ); // foreach raw group
							
							// remove dupes
							user.roles = [ ...new Set(user.roles) ];
						} // sso.group_role_map
						
						if (sso.group_privilege_map) {
							if (sso.replace_privileges) user.privileges = {};
							
							raw_groups.forEach( function(raw_group) {
								(sso.group_privilege_map[raw_group] || []).forEach( function(priv) { user.privileges[priv] = 1; } );
							}); // foreach raw group
						}
						
						// special case: if admin privilege is granted, remove all other privileges
						if (user.privileges.admin) user.privileges = { admin: 1 };
					} // roles and privs
					
					// special admin bootstrap (log warning if used)
					if (sso.admin_bootstrap && (username === sso.admin_bootstrap)) {
						user.privileges = { admin: 1 };
						
						var activity_args = self.getClientInfo(args, { 
							user: Tools.copyHashRemoveKeys( user, { password: 1, salt: 1 } ),
							description: "SSO: User was bootstrapped into a full administrator: " + username
						});
						self.logActivity('warning', activity_args);
						self.logUserActivity(user.username, 'warning', activity_args);
					} // admin_bootstrap
					
						self.createSSOSession(args, user, new_user, function(err) {
							if (err) return self.doSSOError('user', "Internal Error: Failed to create SSO session: " + err, callback);

							if (Tools.firstKey(args.query)) {
								var final_url = self.web.getSelfURL( args.request, args.request.url.replace(/\?.*$/, '') );
								self.logSSO(6, "Final redirect: " + final_url);
								callback( "302 Found", { Location: final_url }, "" );
							}
							else {
								args.internalFile = Path.resolve('htdocs/index.html');
								args.internalTTL = 'private, max-age=0';
								callback(false);
							}
						}, function(finish) {
							if (new_user && external_user.avatar) self.importExternalAvatar(username, external_user.avatar, finish);
							else finish();
						});
					}; // finish

					finish();
				
			} ); // user get
		} ); // loadSession
	}
	
	importExternalAvatar(username, url, callback) {
		// import external avatar for user
		var self = this;
		var temp_file = Path.join( os.tmpdir(), 'xyops-avatar-temp-' + Tools.generateShortID() + '.bin' );
		
		this.logSSO(7, `Importing external avatar for user: ${username}: ${url}`);
		
		this.request.get( url, { timeout: 5 * 1000, download: temp_file }, function(err, resp, data, perf) {
			if (err) {
				self.logSSO(5, "Failed to fetch user avatar image: " + err);
				return callback();
			}
			
			var base_path = '/users/' + username + '/avatar';
			var sizes = [256, 64];
			
			async.eachSeries( sizes,
				function(size, callback) {
					self.resizeStoreImage( temp_file, size, size, base_path + '/' + size + '.png', callback );
				},
				function(err) {
					// all done with all image sizes
					if (err) self.logSSO(5, "Failed to process imported avatar image: " + err.toString());
					else self.logSSO(7, "Successfully imported avatar image for user: " + username);
					
					// delete temp file and fire callback
					fs.unlink( temp_file, function() { callback(); } );
				}
			); // eachSeries
		} ); // request.get
	}
	
	execSSOCommand(args, callback) {
		// run custom sso command to intercept request and inject headers
		var self = this;
		var sso = this.config.get('SSO');
		var request = args.request;
		
		var hook_args = {};
		hook_args.xy = 1; // wire protocol version
		hook_args.type = 'sso'; // wire action
		hook_args.config = sso;
		hook_args.base_app_url = this.config.get('base_app_url');
		hook_args.method = request.method;
		hook_args.url = request.url;
		hook_args.headers = request.headers;
		hook_args.cookies = args.cookies;
		hook_args.query = args.query;
		hook_args.id = args.id;
		hook_args.ip = args.ip;
		hook_args.ips = args.ips;
		
		var child_cmd = sso.command;
		var child_opts = {
			cwd: os.tmpdir(),
			env: Object.assign( {}, this.cleanEnv() ),
			timeout: 60 * 1000
		};
		
		child_opts.env['XYOPS'] = this.server.__version;
		
		var puid = this.config.getPath('default_plugin_credentials.sso.uid') || '';
		var pgid = this.config.getPath('default_plugin_credentials.sso.gid') || '';
		
		if (puid && (puid != 0)) {
			var user_info = Tools.getpwnam( puid, true );
			if (user_info) {
				child_opts.uid = parseInt( user_info.uid );
				child_opts.gid = parseInt( user_info.gid );
				child_opts.env.USER = child_opts.env.USERNAME = user_info.username;
				child_opts.env.HOME = user_info.dir;
				child_opts.env.SHELL = user_info.shell;
			}
			else {
				return this.doSSOError('sso', "Could not determine user information for: " + puid, callback);
			}
		}
		if (pgid && (pgid != 0)) {
			var grp_info = Tools.getgrnam( pgid, true );
			if (grp_info) {
				child_opts.gid = grp_info.gid;
			}
			else {
				return this.doSSOError('sso', "Could not determine group information for: " + pgid, callback);
			}
		}
		
		this.logSSO(5, "Calling SSO Plugin for request ID: " + args.id + ": " + child_cmd);
		
		// sensitive data: only log at level 9
		this.logSSO(9, "Plugin input data for req: " + args.id, hook_args);
		
		var child = cp.exec( child_cmd, child_opts, function(err, stdout, stderr) {
			// parse json from output
			var json = null;
			if (!err && stdout.match(/\S/)) {
				// parse last line only, to omit any noise from plugin
				try { json = JSON.parse( stdout.replace(/\r\n/g, "\n").trim().split(/\n/).pop() ); }
				catch (e) {
					err = new Error("JSON Parse Error: " + (e.message || e));
					err.code = 'json';
				}
			}
			
			// sensitive data: only log at level 9
			self.logSSO(9, "Plugin raw response for req: " + args.id, { stdout, stderr });
			
			var err_prefix = "SSO Plugin Error: ";
			if (err) {
				return self.doSSOError('sso', err_prefix + err, callback);
			}
			if (!json) {
				return self.doSSOError('sso', err_prefix + "No JSON found in response STDOUT", callback);
			}
			if (!json.xy) {
				return self.doSSOError('sso', err_prefix + "No XYWP format flag found in response JSON", callback);
			}
			if (json.code) {
				return self.doSSOError('sso', err_prefix + (json.description || json.code), callback);
			}
			if (!json.headers || !Tools.isaHash(json.headers)) {
				return self.doSSOError('sso', err_prefix + "No headers found in response JSON", callback);
			}
			
			// sensitive data: only log at level 9
			self.logSSO(9, "Plugin JSON response for req: " + args.id, json);
			
			// allow plugin to force a redirect
			if (json.redirect) {
				return callback( "302 Found", json.headers, "" );
			}
			
			// merge headers back into original request
			Tools.mergeHashInto(request.headers, json.headers);
			
			// add re-entry flag
			args._sso_command_response = true;
			
			// recurse for SSO
			self.handleSSO(args, callback);
		} ); // cp.exec
		
		// Write hook data to child's stdin
		child.stdin.on('error', noop);
		child.stdin.write( JSON.stringify(hook_args) + "\n" );
		child.stdin.end();
	}
	
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
			var state_path = self.getGoogleSSOStatePath(state);

			self.storage.put(state_path, record, function(err) {
				if (err) return self.doSSOError('sso', 'Google SSO is temporarily unavailable.', callback);
				self.storage.expire(state_path, record.expires);

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
		this.storage.lock(state_path, true, function(err) {
			if (err) return self.doSSOError('sso', 'Google SSO authentication failed.', callback);

			self.storage.get(state_path, function(err, record) {
				if (err || !record || (record.state !== state) || (record.expires <= Tools.timeNow(true))) {
					self.storage.unlock(state_path);
					return self.doSSOError('sso', 'Google SSO authentication failed.', callback);
				}

				self.storage.delete(state_path, function(err) {
					self.storage.unlock(state_path);
					if (err) return self.doSSOError('sso', 'Google SSO authentication failed.', callback);

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
			});
		});
	}

	api_sso_logout(args, callback) {
		// show logout page but with special message about IdP logout
		var name = this.config.getPath('client.name');
		args.params = {
			type: 'info',
			title: name + ' Logout Successful',
			description: `You have been logged out of ${name}, however your SSO Identity Provider is likely still keeping you logged in with them.  You may need to take additional actions to truly log yourself all the way out.`
		};
		this.api_message(args, callback);
	}
	
}; // class SSO

module.exports = SSO;
