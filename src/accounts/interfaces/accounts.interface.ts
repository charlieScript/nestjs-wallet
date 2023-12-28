import { TRANSACTION_PURPOSE } from "src/typeorm";

export interface IBaseAccountAction {
  amount: number;
  accountId: string;
  purpose: TRANSACTION_PURPOSE;
  reference?: string;
  metadata: any;
}

export interface ICreditAccount extends IBaseAccountAction {}

export interface IDebitAccount extends IBaseAccountAction {}

export interface IDepositAccount {
  accountId: string;
  amount: number;
}
