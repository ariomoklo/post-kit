import type { User } from 'lucia';
import VerifyEmail from './template/verify-email.svelte';
import { render } from 'svelte-email';
import { mailer } from './mailer';
import { env } from '$env/dynamic/private';

export async function sendEmailVerification(user: User, link: string) {
	const body = await render({
		template: VerifyEmail,
		props: {
			username: user.username,
			fullname: user.fullname,
			link
		}
	});

	const info = await mailer.sendMail({
		from: env.MAILER_AUTH_USER,
		to: user.email,
		subject: `Hi, ${user.username}. Verify your email address!`,
		html: body
	});

	return info;
}
