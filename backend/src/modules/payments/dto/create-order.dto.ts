import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID of the listing to unlock' })
  @IsString()
  @IsNotEmpty()
  readonly listingId!: string;
}
