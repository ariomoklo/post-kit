import { verifyEmailToken } from '$lib/server/database/function/auth';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserData } from '$lib/server/database/function/users';

// return page with no javascript files mean no client execution.
export const csr = false;

export const load: PageServerLoad = async ({ params }) => {
	const token = params.token;
	const result = await verifyEmailToken.run(token);
	if (result.ok === false) return error(400, 'Invalid validation token');

	const user = await getUserData.run(result.userid);
	if (user.ok === true) return { userdata: user.data };
	return { userdata: null };
};
