import { decimal, pgTable, uuid } from 'drizzle-orm/pg-core';
import { Base } from '../utils/base.entity';
import { User } from './user.entity';
import { relations } from 'drizzle-orm';
import { Transaction } from './transactions.entity';

export const Account = pgTable('accounts', {
  ...Base,
  balance: decimal('balance', { precision: 20, scale: 4 }).notNull(),
  userId: uuid('user_id').references(() => User.id),
});

export const accountRelations = relations(Account, ({ many }) => ({
  transactions: many(Transaction),
}));