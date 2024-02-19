import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { signout } from '$lib/server/database/function/auth';

export const GET: RequestHandler = async ({ locals, cookies }) => {
	if (locals.session) {
		const cookie = await signout.run(locals);
		cookies.set(cookie.name, cookie.value, {
			path: '.',
			...cookie.attributes
		});
	}

	return redirect(307, '/auth/signin');
};
