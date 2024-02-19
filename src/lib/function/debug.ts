import { dev } from '$app/environment';

export function devlog(tag: string, ...data: unknown[]) {
	if (dev) {
		console.log('# DEVLOG: ' + tag.toUpperCase());
		console.log(...data);
		console.log('#');
	}
}
