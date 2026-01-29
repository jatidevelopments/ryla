import { IsNumber, IsString, IsEmail, IsOptional } from 'class-validator';

export class FinbyFunnelSetupDto {
  @IsNumber()
  productId!: number;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  cardHolder?: string;

  @IsOptional()
  @IsString()
  billingStreet?: string;

  @IsOptional()
  @IsString()
  billingCity?: string;

  @IsOptional()
  @IsString()
  billingPostcode?: string;

  @IsOptional()
  @IsString()
  billingCountry?: string;

  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;

  @IsOptional()
  @IsString()
  errorUrl?: string;

  @IsOptional()
  @IsString()
  notificationUrl?: string;
}
