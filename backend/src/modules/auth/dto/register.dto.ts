import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  readonly email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly password!: string;

  @ApiProperty({ enum: Role, example: Role.CLIENT })
  @IsEnum(Role)
  readonly role!: Role;

  @ApiProperty({ example: 'Ravi Kumar' })
  @IsString()
  @IsNotEmpty()
  readonly fullName!: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional()
  @IsString()
  readonly city?: string;

  @ApiPropertyOptional({ description: 'RERA ID — required for BROKER role' })
  @IsOptional()
  @IsString()
  readonly reraId?: string;
}
