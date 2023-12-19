import { pgTable, varchar } from "drizzle-orm/pg-core";
import { Base } from "../utils/base.entity";

export const User = pgTable('users', {
  ...Base,
  email: varchar('email').notNull().unique(),
});