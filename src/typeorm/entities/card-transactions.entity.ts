import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { Base } from '../utils';
import { Transaction } from './transaction.entity';

@Entity('card_transactions')
export class CardTransactions extends Base {
  @Column({
    nullable: false,
  })
  externalReference: string;

  @OneToOne(() => Transaction)
  @JoinColumn()
  transaction: Transaction;

  constructor(partial: Partial<CardTransactions>) {
    super();
    Object.assign(this, partial);
  }
}
