import { APPLICATION_NAME, UNIQID_LENGTH, USERID_LENGTH } from '$lib/constant.config';
import { isPasswordValid } from '$lib/function/password';
import { isUsernameValid } from '$lib/function/identity';
import { Cookie, generateId, type Session } from 'lucia';
import { Argon2id } from 'oslo/password';
import {
	emailTokens,
	passwordResetTokens,
	users,
	type InsertUserSchema,
	type UserSchema
} from '../schema/auth';
import db from '../db';
import { lucia } from '$lib/server/auth';
import { and, eq, or } from 'drizzle-orm';
import { context, type FunctionReturn } from './+context';
import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo';
import { TOTPController, createTOTPKeyURI } from 'oslo/otp';
import { decodeHex, encodeHex } from 'oslo/encoding';
import { getRandomValues } from 'node:crypto';

type UserAttribute = Omit<UserSchema, 'id' | 'password' | 'isEmailVerified'>;
type AuthData = { session: Session; cookie: Cookie; user: UserSchema };
type ReturnAuth = FunctionReturn<AuthData>;

export const register = context.procedure(
	async ({ $ok, $error, $log }, data: UserAttribute, password: string): Promise<ReturnAuth> => {
		if (!isUsernameValid(data.username)) return $error('username', 'Username is not valid');
		if (!isPasswordValid(password)) return $error('password', 'Password is not valid');

		const id = generateId(USERID_LENGTH);
		const hashed = await new Argon2id().hash(password);
		const userdata: UserSchema = {
			id,
			password: hashed,
			email: data.email,
			twoFactorSecret: null,
			isEmailVerified: false,
			username: data.username,
			fullname: data.fullname !== '' ? data.fullname : data.username
		};

		try {
			await db.insert(users).values(userdata);

			const session = await lucia.createSession(id, {});
			const cookie = lucia.createSessionCookie(session.id);

			return $ok({ session, cookie, user: userdata });
		} catch (error) {
			$log('register error', error);
			return $error('identity', 'Email or username is already used.');
		}
	}
);

export const generateEmailVerificationToken = context.procedure(
	async (_, userid: string, email: string) => {
		await db.delete(emailTokens).where(eq(emailTokens.userid, userid));

		const id = generateId(UNIQID_LENGTH);
		await db.insert(emailTokens).values({
			id,
			userid,
			email,
			expiresAt: createDate(new TimeSpan(1, 'd'))
		});

		return id;
	}
);

export const verifyEmailToken = context.procedure(async ({ $log, $error, $ok }, token: string) => {
	const search = await db
		.select()
		.from(emailTokens)
		.where(eq(emailTokens.id, token))
		.limit(1)
		.catch((error) => {
			$log('verifyEmailToken error', error);
			return [];
		});

	const data = search[0];
	if (!data) return $error('token', 'Invalid verification token');

	// delete verification token from database
	await db.delete(emailTokens).where(eq(emailTokens.id, token));

	if (!isWithinExpirationDate(data.expiresAt)) return $error('token', 'Token expired');

	// update user email verified
	await db.update(users).set({ isEmailVerified: true }).where(eq(users.id, data.userid));
	return $ok(data);
});

export const signin = context.procedure(
	async ({ $error, $ok, $log }, identity: string, password: string): Promise<ReturnAuth> => {
		if (!isPasswordValid(password)) return $error('password', 'Password is not valid');

		// fetch user with email or username equal to identity
		const query = await db
			.select()
			.from(users)
			.limit(1)
			.where(or(eq(users.email, identity), eq(users.username, identity)))
			.catch((err) => {
				$log('signin query error', err);
				return [];
			});

		// check user is exist
		const user = query[0];
		if (!user) return $error('signin', 'Invalid credentials');

		const valid = await new Argon2id().verify(user.password, password);
		if (!valid) return $error('signin', 'Invalid credentials');

		const session = await lucia.createSession(user.id, user);
		const cookie = lucia.createSessionCookie(session.id);

		return $ok({ session, cookie, user });
	}
);

export const signout = context.procedure(async ({ $log }, locals: App.Locals): Promise<Cookie> => {
	$log('signout', locals.session);

	const cookie = lucia.createBlankSessionCookie();
	if (!locals.session) return cookie;

	await lucia.invalidateSession(locals.session.id);
	return cookie;
});

export const createPasswordResetToken = context.procedure(
	async ({ $log, $error, $ok }, username: string, email: string) => {
		const search = await db
			.select()
			.from(users)
			.where(and(eq(users.username, username), eq(users.email, email)))
			.limit(1)
			.catch((error) => {
				$log('createPasswordResetToken error', error);
				return [];
			});

		const user = search[0];
		if (!user) return $error('user', 'Invalid user identity');

		// remove all tokens
		await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userid, user.id));

		const id = generateId(UNIQID_LENGTH);
		await db.insert(passwordResetTokens).values({
			id,
			userid: user.id,
			expiresAt: createDate(new TimeSpan(2, 'h'))
		});

		return $ok({ token: id, userdata: user });
	}
);

export const verifyPasswordResetToken = context.procedure(
	async ({ $log, $error, $ok }, token: string) => {
		// prereq
		const condition = eq(passwordResetTokens.id, token);

		const search = await db
			.select()
			.from(passwordResetTokens)
			.where(condition)
			.limit(1)
			.catch((error) => {
				$log('verifyPasswordResetToken error', error);
				return [];
			});

		const data = search[0];
		if (!data) return $error('token', 'Invalid token');

		// delete token
		await db.delete(passwordResetTokens).where(condition);
		if (!isWithinExpirationDate(data.expiresAt)) return $error('token', 'Token expired');

		return $ok(data);
	}
);

export const updateUserPassword = context.procedure(async (_, userid: string, password: string) => {
	const hashed = await new Argon2id().hash(password);
	await db.update(users).set({ password: hashed }).where(eq(users.id, userid));
});

export const enable2FA = context.procedure(async ({ $error, $ok }, locals: App.Locals) => {
	const user = locals.user;
	if (!user) return $error('user', 'Unauthorized access');

	const secret = getRandomValues(new Uint8Array(20));
	const uri = createTOTPKeyURI(APPLICATION_NAME, user.email, secret);
	await db
		.update(users)
		.set({ twoFactorSecret: encodeHex(secret) })
		.where(eq(users.id, user.id));

	return $ok({ secret, uri });
});

export const get2FAUri = context.procedure(async ({ $log, $error, $ok }, locals: App.Locals) => {
	const user = locals.user;
	if (!user) return $error('user', 'Unauthorized access');
	if (!user.isEnabledTwoFactor) return await enable2FA.run(locals);

	const search = await db
		.select()
		.from(users)
		.where(eq(users.id, user.id))
		.limit(1)
		.catch((error) => {
			$log('getTwoFactorAuthUri error', error);
			return [];
		});

	const userdata = search[0];
	if (!userdata) return $error('user', 'Userdata not found');

	const secret = decodeHex(userdata.twoFactorSecret as string);
	const uri = createTOTPKeyURI(APPLICATION_NAME, user.email, secret);
	return $ok({ secret, uri });
});

export const validate2FAOTP = context.procedure(async (_, secret: string, otp: string) => {
	const validation = await new TOTPController().verify(otp, decodeHex(secret));
	return validation;
});
