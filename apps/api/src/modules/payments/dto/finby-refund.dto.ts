import { IsString, IsNumber } from 'class-validator';

export class FinbyRefundDto {
  @IsString()
  paymentRequestId!: string;

  @IsString()
  reference!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  currency!: string;
}
