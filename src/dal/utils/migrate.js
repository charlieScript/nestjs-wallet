const configuration = require('../../core/config/configuration').configuration;
const drizzle = require('drizzle-orm/postgres-js').drizzle;
const migrate = require('drizzle-orm/postgres-js/migrator').migrate;
const postgres = require('postgres');

const { host, password, port, user, migrationsPath, database } =
  configuration().drizzle;

const runMigrations = async () => {
  const sql = postgres(
    `postgres://${user}:${password}@${host}:${port}/${database}`,
    { max: 1 },
  );
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: migrationsPath });
  await sql.end();
};

runMigrations(); // Optionally, you can call the function if you want to execute it immediately.
