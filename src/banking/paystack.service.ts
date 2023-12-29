import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { paystackClient } from './utils/paystack-client';
import { BankingInterface } from './interface/banking.interface';
import { AxiosInstance } from 'axios';


@Injectable()
export class PaystackService implements BankingInterface {
  private readonly logger = new Logger(PaystackService.name);
  client: AxiosInstance;
  constructor(private configService: ConfigService) {
    const paystackConfig = {
      baseUrl: this.configService.get('paystack.baseUrl'),
      secretKey: this.configService.get('paystack.secretKey'),
    };
    this.client = paystackClient(paystackConfig);
  }
}
