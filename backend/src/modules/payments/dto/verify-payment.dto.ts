import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Merchant transaction ID returned when order was created' })
  @IsString()
  @IsNotEmpty()
  readonly merchantTransactionId!: string;
}
