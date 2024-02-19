import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { sessions, users, type UserAttributes, type UserSchema } from './database/schema/auth';
import { Lucia, TimeSpan, type Session, type User } from 'lucia';
import { webcrypto } from 'node:crypto';
import { dev } from '$app/environment';
import db from './database/db';
import { getUserAttributes } from './database/function/users';
import { redirect, type NumericRange } from '@sveltejs/kit';
import { BASEURL } from '$lib/constant.config';
import { devlog } from '$lib/function/debug';

// Polyfill for lucia. required on nodejs 18 and under
// you could remove this when using nodejs 19 and above
globalThis.crypto = webcrypto as Crypto;

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: UserAttributes;
	}
}

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);
export const lucia = new Lucia(adapter, {
	sessionExpiresIn: new TimeSpan(1, 'w'),
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes
});

/* -------------------------------------------------------------------------- */

class PageAuth {
	session: Session | null = null;
	user: User | null = null;

	protectFn = new Set<() => boolean>();

	get isAuthenticated() {
		return this.session !== null && this.user !== null;
	}

	onAuth(value: boolean) {
		this.protectFn.add(() => this.isAuthenticated === value);
		return this;
	}

	redirect(status: NumericRange<300, 308>, path: string) {
		let doRedirect = false;
		for (const fn of this.protectFn.values()) {
			const valid = fn();
			if (valid === true) doRedirect = true;
		}

		devlog('pageAuth redirect', doRedirect);

		this.protectFn.clear();
		if (doRedirect) throw redirect(status, path);
	}
}

export function usePageAuth(locals: App.Locals) {
	const auth = new PageAuth();
	auth.session = locals.session;
	auth.user = locals.user;
	return auth;
}