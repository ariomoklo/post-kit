import { insertUserSchema } from '$lib/server/database/schema/auth';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { generateEmailVerificationToken, register } from '$lib/server/database/function/auth';
import { sendEmailVerification } from '$lib/server/mailer/function';
import { normalizeUserDB } from '$lib/server/database/function/users';
import { devlog } from '$lib/function/debug';
import { BASEURL } from '$lib/constant.config';

const schema = insertUserSchema.omit({
	id: true,
	isEmailVerified: true,
	twoFactorSecret: true
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(schema));
	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(schema));
		if (!form.valid) return fail(400, { form, error: null });

		devlog('form.data', form.data);

		const result = await register.run(
			{
				email: form.data.email,
				username: form.data.username,
				fullname: form.data.fullname,
				twoFactorSecret: null
			},
			form.data.password
		);

		// checking registering result
		if (result.ok === false)
			return fail(400, { form, error: { tag: result.tag, message: result.message } });

		// parse user database format to lucia auth user format
		const user = normalizeUserDB(result.user);

		// generate email verification token then send email to user email.
		const token = await generateEmailVerificationToken.run(result.user.id, result.user.email);
		sendEmailVerification(user, `${BASEURL}/auth/validate-email/${token}`);

		// redirect user on successful register action
		return redirect(307, '/auth/signin');
	}
} satisfies Actions;
