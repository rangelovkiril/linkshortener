import { IsUrl, IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';

export enum TimeUnit {
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  MONTHS = 'months',
  YEARS = 'years'
}

export class CreateLinkDto {
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  customSlug?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  expiryValue?: number;

  @IsOptional()
  @IsEnum(TimeUnit)
  expiryUnit?: TimeUnit;
}

