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
  bankId: string;
  amount: number;
}
