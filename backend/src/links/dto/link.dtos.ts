import { IsString, IsUrl, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkDto {
  @ApiProperty({ example: 'https://example.com/very-long-url' })
  @IsUrl({ require_protocol: true })
  originalUrl: string;

  @ApiProperty({ 
    example: 'my-custom-link', 
    required: false,
    description: 'Custom alias for the short link',
  })
  @IsOptional()
  @IsString()
  customAlias?: string;

  @ApiProperty({ 
    example: 30, 
    required: false,
    description: 'Number of days until link expires',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expirationDays?: number;
}

export class UpdateLinkDto {
  @ApiProperty({ 
    example: 'new-custom-alias', 
    required: false,
  })
  @IsOptional()
  @IsString()
  customAlias?: string;

  @ApiProperty({ 
    example: true, 
    required: false,
    description: 'Active status of the link',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}