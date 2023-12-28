import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectEntityManager, InjectRepository, TypeOrmDataSourceFactory } from '@nestjs/typeorm';
import {
  Account,
  TRANSACTION_PURPOSE,
  TRANSACTION_TYPE,
  Transaction,
  User,
} from 'src/typeorm';
import { EntityManager, Repository, getManager } from 'typeorm';
import { ICreditAccount, IDebitAccount } from './interfaces/accounts.interface';
import { v4 } from 'uuid';
import { DepositAccountDto } from './dtos/account.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AccountsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,

    @InjectEntityManager()
    private readonly entityManager: EntityManager,

  
  ) {}

  async creditAccount(data: ICreditAccount) {
    const { accountId, amount, purpose, reference = v4(), metadata } = data;

    const account = await this.accountRepo.findOneBy({ id: accountId });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    this.entityManager.transaction(async (manager) => {
      manager.increment(Account, { id: accountId }, 'balance', amount);

      manager.insert(Transaction, {
        amount,
        txnPurpose: purpose,
        txnType: TRANSACTION_TYPE.CREDIT,
        reference,
        metadata,
        account,
        balanceAfter: account.balance + amount,
        balanceBefore: account.balance,
      });
    });
    return {
      success: true,
      message: 'Account credited successfully',
    };
  }

  async debitAccount(data: IDebitAccount) { 
    const { accountId, amount, purpose, reference = v4(), metadata } = data;

    const account = await this.accountRepo.findOneBy({ id: accountId });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (Number(account.balance) < amount) {
      throw new HttpException('Insufficient balance', 400);
    }

    this.entityManager.transaction(async (manager) => {
      manager.decrement(Account, { id: accountId }, 'balance', amount);

      manager.insert(Transaction, {
        amount,
        txnPurpose: purpose,
        txnType: TRANSACTION_TYPE.CREDIT,
        reference,
        metadata,
        account,
        balanceAfter: account.balance - amount,
        balanceBefore: account.balance,
      });
    });
    return {
      code: 201,
      success: true,
      message: 'Account debited successfully',
    };
  }

  async deposit(payload: DepositAccountDto) {
    try {
      await this.entityManager.transaction(async (manager) => {
        const creditResult = await this.creditAccount({
          accountId: payload.accountId,
          amount: payload.amount,
          purpose: TRANSACTION_PURPOSE.DEPOSIT,
          metadata: {},
        });

        if (!creditResult.success) {
          throw new ConflictException('Deposit failed');
        }

        return {
          success: true,
          message: 'Deposit successful',
        };
      });
      
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
        error: 'there was error',
      };
    }
  }

  
}
