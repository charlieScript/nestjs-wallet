import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { paystackClient } from './utils/paystack-client';
import { BankingInterface, IChargeCard } from './interface/banking.interface';
import { AxiosInstance } from 'axios';
import { User } from 'src/typeorm';
import * as Joi from 'joi';


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

  async chargeCard(payload: IChargeCard) {
    const { amount, cvv, expiry_month, expiry_year, pan, email } = payload
    const schema = Joi.object({
      pan: Joi.string().creditCard(),
      cvv: Joi.string().required(),
      expiry_month: Joi.string().required(),
      expiry_year: Joi.string().required(),
      amount: Joi.number().required(),
    });

    const validation = schema.validate({ pan, cvv, expiry_month, expiry_year, amount });
    if (validation.error) {
      return {
        success: false,
        error: validation.error.details[0].message,
      };
    }


    try {
      const charge = await this.client.post('/charge', {
        number: pan,
        cvv,
        expiry_month,
        expiry_year,
        amount,
        email,
      });

      if (charge.data.status === true) {
        return {
          success: true,
          data: charge.data,
        }
      }
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
        error: error.message,
      }
    }
  }
}
