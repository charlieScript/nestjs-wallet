export const BANKING_SERVICE = 'BANKING_SERVICE';

export interface BankingInterface {
  client: any;
  chargeCard(data: IChargeCard): Promise<any>;
}

export interface IChargeCard {
  pan: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  amount: number;
  email: string;
}
