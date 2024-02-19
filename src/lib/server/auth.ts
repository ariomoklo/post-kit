import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { sessions, users, type UserAttributes, type UserSchema } from './database/schema/auth';
import { Lucia, TimeSpan } from 'lucia';
import { webcrypto } from 'node:crypto';
import { dev } from '$app/environment';
import db from './database/db';
import { getUserAttributes } from './database/function/users';

// Polyfill for lucia. required on nodejs 18 and under
// you could remove this when using nodejs 19 and above
globalThis.crypto = webcrypto as Crypto;

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

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: UserAttributes;
	}
}
