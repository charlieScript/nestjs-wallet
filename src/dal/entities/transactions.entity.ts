import { decimal, jsonb, pgEnum, pgTable, uuid } from 'drizzle-orm/pg-core';
import { Base } from '../utils/base.entity';
import { User } from './user.entity';
import { TXN_PURPOSE, TXN_TYPE } from '../enums';
import { relations } from 'drizzle-orm';
import { Account } from './accounts.entity';

const txnTypeEnum = Object.keys(TXN_TYPE).map((k) => k);
const txnPurposeEnum = Object.keys(TXN_PURPOSE).map((k) => k);


export const TxnTypeEnum = pgEnum('txn_type', [txnTypeEnum[0], ...txnTypeEnum]);
export const TxnPurposeEnum = pgEnum('txn_purpose', [txnPurposeEnum[0], ...txnPurposeEnum]);


export const Transaction = pgTable('transactions', {
  ...Base,
  txnType: TxnTypeEnum('txn_type').notNull(),
  txnPurpose: TxnPurposeEnum('txn_purpose').notNull(),
  amount: decimal('amount', { precision: 20, scale: 4 }).notNull(),
  reference: uuid('reference').unique(),
  balanceBefore: decimal('balance_before', { precision: 20, scale: 4 }).notNull(),
  balanceAfter: decimal('balance_after', { precision: 20, scale: 4 }).notNull(),
  metadata: jsonb('metadata'),
  accountId: uuid('account_id').references(() => Account.id),
});

export const transactionRelations = relations(Transaction, ({ one }) => ({
  account: one(Account, {
    fields: [Transaction.accountId],
    references: [Account.id],
  }),
}));

