import { PASSWORD_MIN_LENGTH } from '$lib/constant.config';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { signin } from '$lib/server/database/function/auth';
import { usePageAuth } from '$lib/server/auth';

const schema = z.object({
	identity: z.string().min(5),
	password: z.string().min(PASSWORD_MIN_LENGTH)
});

export const load: PageServerLoad = async ({ locals }) => {
	// redirect on authenticated user
	usePageAuth(locals).onAuth(true).redirect(307, '/');

	const form = await superValidate(zod(schema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(schema));
		if (!form.valid) return fail(400, { form, error: null });

		const res = await signin.run(form.data.identity, form.data.password);
		if (res.ok === false) return fail(400, { form, error: res.message });

		// set session cookie
		cookies.set(res.cookie.name, res.cookie.value, {
			path: '.',
			...res.cookie.attributes
		});

		redirect(307, '/');
	}
};
