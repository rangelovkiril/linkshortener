import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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