import { ConflictException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  Account,
  CardTransactions,
  TRANSACTION_PURPOSE,
  TRANSACTION_TYPE,
  Transaction,
  User,
} from 'src/typeorm';
import { QueryRunner, DataSource, Repository } from 'typeorm';
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
import { InjectRepository } from '@nestjs/typeorm';
import {
  BANKING_SERVICE,
  BankingInterface,
} from 'src/banking/interface/banking.interface';
import { ChargeCardDto } from './dtos/account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    private entityManager: DataSource,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @Inject(BANKING_SERVICE)
    private readonly bankingService: BankingInterface,
  ) {}

  async getBalance(userId: string) {
    const account = await this.getAccountByUserId(userId);
    return account?.balance;
  }

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
        await t.rollbackTransaction();
        throw new ConflictException('Deposit failed');
      }

      await t.commitTransaction();

      return {
        success: true,
        message: 'Deposit successful',
      };
    } catch (error) {
      await t.rollbackTransaction();
      this.logger.error(error);
      return {
        success: false,
        error: 'there was error',
      };
    } finally {
      await t.release();
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
      await t.rollbackTransaction();
      this.logger.error(error);
      return {
        success: false,
        error: 'there was error',
      };
    } finally {
      await t.release();
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
      await t.release();
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
        return this.debitAccount(
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
      await t.release();
    }
  }

  async cardFunding(payload: ChargeCardDto, user: User) {
    const { amount, cvv, expiry_month, expiry_year, pan } = payload;
      const t = await this.transactionProvider();
    try {
      const account = await this.getAccountByUserId(user.id);

      const chargeCardResult = await this.bankingService.chargeCard({
        amount,
        cvv,
        expiry_month,
        expiry_year,
        pan,
        email: user.email,
      });

      console.log('chargeCardResult', chargeCardResult);



      if (chargeCardResult.success) {
        await this.creditAccount(
          {
            accountId: account.id,
            amount,
            purpose: TRANSACTION_PURPOSE.CARD_FUNDING,
            metadata: {
              reference: chargeCardResult.data.reference,
            },
          },
          t,
        );
        const cardTx = this.entityManager.manager.create(CardTransactions, {
          externalReference: chargeCardResult.data.reference
        })

        await this.entityManager.manager.save(cardTx)
      }

      await t.commitTransaction();
      return {
        success: true,
        message: 'Card funding successful',
      };
    } catch (error) {
      console.error(error);
      await t.rollbackTransaction();
      throw new InternalServerErrorException('Internal server error');
    } finally {
      await t.release()
    }
  }

  private async transactionProvider() {
    const t = this.entityManager.createQueryRunner();

    await t.connect();
    await t.startTransaction();
    return t;
  }

  private async getAccountByUserId(userId: string): Promise<Account | null> {
    return this.accountRepo
      .createQueryBuilder('account')
      .innerJoinAndSelect('account.user', 'user', 'user.id = :userId', {
        userId,
      })
      .getOne();
  }
}
