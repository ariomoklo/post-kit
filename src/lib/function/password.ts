import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '$lib/constant.config';

export function isPasswordValid(pass: string) {
	// password must be string
	if (typeof pass !== 'string') return false;

	// check min and max length of the string
	if (pass.length < PASSWORD_MIN_LENGTH) return false;
	if (pass.length > PASSWORD_MAX_LENGTH) return false;

	// must contain number
	if (!/\d/.test(pass)) return false;

	// must contain special string
	if (!/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/) return false;

	return true;
}
