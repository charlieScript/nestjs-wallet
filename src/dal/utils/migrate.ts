import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { configuration } from '../../core/config/configuration';

const { host, password, port, database, user, migrationsPath } =
  configuration().drizzle;


const runMigrations = async () => {
  const sql = postgres(`postgres://${user}:${password}@${host}:${port}/${database}`, { max: 1 });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: migrationsPath });
  await sql.end();
};

runMigrations();


