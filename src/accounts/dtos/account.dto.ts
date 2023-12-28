import { IsNotEmpty, IsNumber, IsUUID, Min } from "class-validator";
import { IDepositAccount } from "../interfaces/accounts.interface";

export class DepositAccountDto implements IDepositAccount {
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;
}