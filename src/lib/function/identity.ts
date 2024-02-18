import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '$lib/constant.config';

export function isUsernameValid(name: string) {
	if (typeof name !== 'string') return false;
	if (name.length < USERNAME_MIN_LENGTH) return false;
	if (name.length > USERNAME_MAX_LENGTH) return false;
	return true;
}

export function isEmailValid(email: string) {
	return /.+@.+/.test(email);
}
