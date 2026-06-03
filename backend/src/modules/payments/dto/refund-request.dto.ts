import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RefundRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  readonly reason!: string;
}
