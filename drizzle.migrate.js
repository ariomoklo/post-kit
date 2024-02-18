import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import 'dotenv/config';

const connection = process.env.POSTGREDB;

if (typeof connection !== 'string') throw new Error('Connection string is undefined!');

const sql = postgres(connection, { max: 1 });
const db = drizzle(sql);

await migrate(db, { migrationsFolder: './.drizzle' });
await sql.end();
