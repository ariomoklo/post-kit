# [template] Post-kit

minimal project template with stack:

- [sveltekit](https://kit.svelte.dev)
- postgres
- [drizzleORM](https://orm.drizzle.team)
- [lucia-auth](https://lucia-auth.com)
- [nodemailer](https://nodemailer.com/about/)

# Features

## Drizzle ORM

Drizzle ORM is used to send query to postgres. in production postgresjs is used as a provider. But for development and database migration a.k.a drizzle-kit, pg is used. So pg is added as dev dependency.

```
# do not forget to setup connection uri in env var.
POSTGREDB="postgresql://..."
```

Schema structure is separated in different file based on use. This will make removing feature that use database is easy. to create another schema use this hierarchy structure:

- src/lib/server/: sveltekit read this and make sure all code under server folder will not passed to the client.
  - database/: drizzle related file should be put this except drizzle-kit configuration
    - function/: put all function related to database querying here.
    - schema/: put all database schema herer.
    - db.ts: database instance and configuration. to use databate get `db` from here.
- drizzle.config.ts: drizzle-kit configuration file
- drizzle.migrate.ts: drizzle-kit migrate script. only run this in the first time migration.

``` bash
# Here is command used related to databse

# used for generating migration file
$ pnpm db:generate

# used for migrating based on migration file
$ pnpm db:migrate

# used for quickly push schema changes to database
$ pnpm db:push
```

## Lucia Auth

Authentication using lucia-auth. readmore on [lucia-auth documentation](https://lucia-auth.com/getting-started/).

- src/lib/server/: sveltekit read this and make sure all code under server folder will not passed to the client.
  - database/function/auth.ts: database function related to lucia-auth
  - database/schema/auth.ts: drizzle lucia auth related schema
  - auth.ts: lucia-auth file instance