import { pgTable, varchar } from "drizzle-orm/pg-core";
import { Base } from "../utils/base.entity";
import { relations } from "drizzle-orm";
import { Account } from "./accounts.entity";

export const User = pgTable('users', {
  ...Base,
  email: varchar('email').notNull().unique(),
  username: varchar('username').notNull().unique(),
  password: varchar('password').notNull(),
});

export const usersRelations = relations(User, ({ one }) => ({
  account: one(Account),
}));