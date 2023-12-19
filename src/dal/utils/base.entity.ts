import { date, uuid } from "drizzle-orm/pg-core";

export const Base = {
  id: uuid('id').primaryKey(),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
};
