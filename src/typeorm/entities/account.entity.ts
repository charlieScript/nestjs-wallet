import { Column, Entity, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from '../utils';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { ColumnNumericTransformer } from '../utils/transformer';

@Entity()
export class Account extends Base {
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
    unsigned: true,
    transformer: new ColumnNumericTransformer(),
  })
  balance: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToMany(() => Transaction, (transactions) => transactions.account)
  transactions: Transaction[];

  constructor(partial: Partial<Account>) {
    super();
    Object.assign(this, partial);
  }
}
