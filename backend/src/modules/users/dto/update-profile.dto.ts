import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsMobilePhone } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly employmentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly incomeRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly reraId?: string;
}
