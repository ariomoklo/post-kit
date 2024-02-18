/** @type import('drizzle-kit').Config */
export default {
	schema: './src/lib/server/database/schema/*',
	out: './.drizzle',
	driver: 'pg',
	dbCredentials: {
		connectionString: process.env.POSTGREDB
	}
};
