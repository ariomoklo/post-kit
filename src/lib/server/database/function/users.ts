import { eq } from 'drizzle-orm';
import db from '../db';
import { users, type UserAttributes, type UserSchema } from '../schema/auth';
import { context } from './+context';
import type { User } from 'lucia';

export function getUserAttributes(attributes: UserAttributes) {
	return {
		email: attributes.email,
		username: attributes.username,
		fullname: attributes.fullname,
		isEmailVerified: attributes.isEmailVerified,
		isEnabledTwoFactor: attributes.twoFactorSecret !== null
	};
}

export function normalizeUserDB(userDataDB: UserSchema): User {
	return {
		id: userDataDB.id,
		...getUserAttributes(userDataDB)
	};
}

export const getUserData = context.procedure(async ({ $log, $error, $ok }, userid: string) => {
	const search = await db
		.select()
		.from(users)
		.where(eq(users.id, userid))
		.limit(1)
		.catch((error) => {
			$log('getUserData error', error);
			return [];
		});

	const data = search[0];
	if (!data) return $error('user', 'User is not found');

	return $ok({
		data,
		attributes: getUserAttributes(data)
	});
});
