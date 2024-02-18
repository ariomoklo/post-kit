import { dev } from '$app/environment';
import { createContext } from 'hansip';

export type FunctionReturn<T extends Record<string, any>> =
	| ({ ok: true } & T)
	| { ok: false; tag: string; message: string };

export const context = createContext(() => {
	function $error(tag: string, message: string) {
		return { ok: false, tag, message } as { ok: false; tag: string; message: string };
	}

	function $ok<T extends Record<string, any>>(data: T) {
		return { ok: true, ...data } as { ok: true } & T;
	}

	function $log(tag: string, ...data: unknown[]) {
		if (dev) console.log(tag, ...data);
	}

	return { $error, $ok, $log };
});
