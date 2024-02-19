import { usePageAuth } from '$lib/server/auth';
import type { User } from 'lucia';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// redirect non authenticated user to signin page
	usePageAuth(locals).onAuth(false).redirect(307, '/auth/signin');

	const user = locals.user as User;
	return { user };
};
