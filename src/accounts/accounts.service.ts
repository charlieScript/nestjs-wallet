import {
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  Account,
  TRANSACTION_PURPOSE,
  TRANSACTION_TYPE,
  Transaction,
} from 'src/typeorm';
import { QueryRunner, DataSource } from 'typeorm';
import {
  ICreditAccount,
  IDebitAccount,
  IDepositAccount,
  ITransferAccount,
  IWithdrawAccount,
} from './interfaces/accounts.interface';
import { v4 } from 'uuid';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import Joi from 'joi';

@Injectable()
export class AccountsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    private entityManager: DataSource,
  ) {}


  async creditAccount(data: ICreditAccount, t: QueryRunner) {
    const { accountId, amount, purpose, reference = v4(), metadata } = data;

    const account = await t.manager.findOneBy(Account, { id: accountId });

    if (!account) {
      return {
        success: false,
        error: 'Account not found',
      };
    }

    t.manager.increment(Account, { id: accountId }, 'balance', amount);

    t.manager.insert(Transaction, {
      amount,
      txnPurpose: purpose,
      txnType: TRANSACTION_TYPE.CREDIT,
      reference,
      metadata,
      account,
      balanceAfter: account.balance + amount,
      balanceBefore: account.balance,
    });
    return {
      success: true,
      message: 'Account credited successfully',
    };
  }

  async debitAccount(data: IDebitAccount, t: QueryRunner) {
    const { accountId, amount, purpose, reference = v4(), metadata } = data;

    const account = await t.manager.findOneBy(Account, { id: accountId });

    if (!account) {
      return {
        success: false,
        error: 'Account not found',
      };
    }

    if (Number(account.balance) < amount) {
      return {
        success: false,
        error: 'Insufficient balance',
      };
    }

    t.manager.decrement(Account, { id: accountId }, 'balance', amount);

    t.manager.insert(Transaction, {
      amount,
      txnPurpose: purpose,
      txnType: TRANSACTION_TYPE.CREDIT,
      reference,
      metadata,
      account,
      balanceAfter: account.balance - amount,
      balanceBefore: account.balance,
    });
    return {
      code: 201,
      success: true,
      message: 'Account debited successfully',
    };
  }

  async deposit(payload: IDepositAccount) {
    const { accountId, amount } = payload;
    const schema = Joi.object({
      accountId: Joi.string().uuid().required(),
      amount: Joi.number().min(1).required(),
    });
    const validation = schema.validate({ accountId, amount });
    if (validation.error) {
      return {
        success: false,
        error: validation.error.details[0].message,
      };
    }

    const t = await this.transactionProvider();

    try {
      const creditResult = await this.creditAccount(
        {
          accountId: payload.accountId,
          amount: payload.amount,
          purpose: TRANSACTION_PURPOSE.DEPOSIT,
          metadata: {},
        },
        t,
      );

      if (!creditResult.success) {
        t.rollbackTransaction();
        throw new ConflictException('Deposit failed');
      }

      t.commitTransaction();

      return {
        success: true,
        message: 'Deposit successful',
      };
    } catch (error) {
      t.rollbackTransaction();
      this.logger.error(error);
      return {
        success: false,
        error: 'there was error',
      };
    } finally {
      t.release();
    }
  }

  async withdraw(payload: IWithdrawAccount) {
    const { accountId, amount } = payload;
    const schema = Joi.object({
      accountId: Joi.string().uuid().required(),
      amount: Joi.number().min(1).required(),
    });
    const validation = schema.validate({ accountId, amount });
    if (validation.error) {
      return {
        success: false,
        error: validation.error.details[0].message,
      };
    }
    const t = await this.transactionProvider();

    try {
      const debitResult = await this.debitAccount(
        {
          accountId,
          amount,
          purpose: TRANSACTION_PURPOSE.WITHDRAWAL,
          metadata: {},
        },
        t,
      );

      if (!debitResult.success) {
        await t.rollbackTransaction();
        return debitResult;
      }

      await t.commitTransaction();
      return {
        success: true,
        message: 'withdrawal successful',
      };
    } catch (error) {
      t.rollbackTransaction();
      this.logger.error(error);
      return {
        success: false,
        error: 'there was error',
      };
    } finally {
      t.release();
    }
  }

  async transfer(payload: ITransferAccount) {
    const { senderAccountId, receiverAccountId, amount } = payload;
    const schema = Joi.object({
      senderAccountId: Joi.string().uuid().required(),
      receiverAccountId: Joi.string().uuid().required(),
      amount: Joi.number().min(1).required(),
    });


    const validation = schema.validate({
      senderAccountId,
      receiverAccountId,
      amount,
    });

    if (validation.error) {
      return {
        success: false,
        error: validation.error.details[0].message,
      };
    }

    console.log('validation', validation);

    const t = await this.transactionProvider();

    try {
      const transferResult = await Promise.all([
        this.debitAccount(
          {
            amount,
            accountId: senderAccountId,
            purpose: TRANSACTION_PURPOSE.TRANSFER,
            metadata: {
              receiverAccountId,
            },
          },
          t,
        ),
        this.creditAccount(
          {
            amount,
            accountId: receiverAccountId,
            purpose: TRANSACTION_PURPOSE.TRANSFER,
            metadata: {
              senderAccountId,
            },
          },
          t,
        ),
      ]);

      const failedTxns = transferResult.filter((result) => !result.success);
      if (failedTxns.length) {
        await t.rollbackTransaction();
        return transferResult;
      }

      await t.commitTransaction();
      return {
        success: true,
        message: 'transfer successful',
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: 'there was error',
      };
    } finally {
      t.release();
    }
  }

  async reverse(reference: string) {
    const t = await this.transactionProvider();
    const purpose = TRANSACTION_PURPOSE.REVERSAL;
    const txn_reference = v4();
    try {
      const transactions = await t.manager.find(Transaction, {
        where: {
          reference,
        },
        relations: ['account'],
      });

      const transactionsArray = transactions.map((transaction) => {
        if (transaction.txnType === 'debit') {
          return this.creditAccount(
            {
              amount: transaction.amount,
              accountId: transaction.account.id,
              metadata: {
                originalReference: transaction.reference,
              },
              purpose,
              reference: txn_reference,
            },
            t,
          );
        }
        return this.debitAccount({
          amount: transaction.amount,
          accountId: transaction.account.id,
          metadata: {
            originalReference: transaction.reference,
          },
          purpose,
          reference: txn_reference,
        }, t);
      });

      const reversalResult = await Promise.all(transactionsArray);


      const failedTxns = reversalResult.filter((result) => !result.success);
      if (failedTxns.length) {
        await t.rollbackTransaction();
        return reversalResult;
      }

       await t.commitTransaction();
       return {
         success: true,
         message: 'Reversal successful',
       };

    } catch (error) {
      await t.rollbackTransaction();
      return {
        success: false,
        error: 'Internal server error',
      };
    } finally {
      t.release();
    }
  }

  private async transactionProvider() {
    const t = this.entityManager.createQueryRunner();

    await t.connect();
    await t.startTransaction();
    return t;
  }
}
