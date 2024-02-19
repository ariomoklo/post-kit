import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { devlog } from '$lib/function/debug';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const options: SMTPTransport.Options = {
	host: env.MAILER_HOST,
	port: parseInt(env.MAILER_PORT),
	secure: !dev,
	auth: {
		user: env.MAILER_AUTH_USER,
		pass: env.MAILER_AUTH_PASS
	}
};

// mailer using smtp server
export const mailer = nodemailer.createTransport(options);
devlog('mailer setup', options);
