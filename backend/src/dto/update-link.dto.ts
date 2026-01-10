// ============================================
// src/dto/update-link.dto.ts (COMPLETE FILE)
// ============================================
import { IsOptional, IsString, IsUrl, IsNumber, IsEnum } from 'class-validator';
import { TimeUnit } from './create-link.dto';

export class UpdateLinkDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsUrl()
  originalUrl?: string;

  @IsOptional()
  @IsNumber()
  expiryValue?: number;

  @IsOptional()
  @IsEnum(TimeUnit)
  expiryUnit?: TimeUnit;
}
