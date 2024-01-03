import { IsCreditCard, IsNotEmpty, IsNumber, IsUUID, Max, Min } from "class-validator";
import { IDepositAccount } from "../interfaces/accounts.interface";
import { IChargeCard } from "src/banking";

export class DepositAccountDto implements IDepositAccount {
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;
}

export class ChargeCardDto implements IChargeCard {
  @IsCreditCard()
  @IsNotEmpty()
  pan: string;

  @IsNotEmpty()
  // @Min(3)
  cvv: string;

  @IsNotEmpty()
  expiry_month: string;

  @IsNotEmpty()
  expiry_year: string;

  @IsNotEmpty()
  amount: number;
}