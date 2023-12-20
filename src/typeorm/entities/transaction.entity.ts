import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../utils';
import { TRANSACTION_TYPE, TRANSACTION_PURPOSE } from '../enum';
import { Account } from './account.entity';
import { ColumnNumericTransformer } from '../utils/transformer';

@Entity()
export class Transaction extends Base {
  @Column({ type: 'enum', enum: TRANSACTION_TYPE })
  txnType: TRANSACTION_TYPE;

  @Column({ type: 'enum', enum: TRANSACTION_PURPOSE })
  txnPurpose: TRANSACTION_PURPOSE;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
    unsigned: true,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({ nullable: true, type: 'uuid' })
  reference: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
    unsigned: true,
    transformer: new ColumnNumericTransformer(),
  })
  balanceBefore: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
    unsigned: true,
    transformer: new ColumnNumericTransformer(),
  })
  balanceAfter: number;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @ManyToOne(() => Account, (account) => account.transactions)
  account: Account;

  constructor(partial: Partial<Transaction>) {
    super();
    Object.assign(this, partial);
  }
}
