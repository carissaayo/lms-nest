import { IsString, IsUUID, IsNotEmpty, IsNumber } from 'class-validator';
export class AddBankDto {
  @IsString()
  @IsNotEmpty({ message: 'accountNumber is required' })
  accountNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'bankName is required' })
  bankName: string;

  @IsString()
  @IsNotEmpty({ message: 'bankCode is required' })
  bankCode: string;
}

export class WithdrawDto {
  @IsString()
  @IsNotEmpty({ message: 'bankId is required' })
  bankId: string;

  @IsNumber()
  @IsNotEmpty({ message: 'amount is required' })
  amount: number;
}

export class ConfirmWithdrawDto {
  @IsString()
  @IsNotEmpty({ message: 'code is required' })
  code: string;
}
