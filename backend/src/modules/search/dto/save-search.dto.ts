import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class SaveSearchDto {
  @ApiPropertyOptional({ example: 'My Koramangala search' })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiProperty({ description: 'JSON object of search filters' })
  @IsObject()
  @IsNotEmpty()
  readonly filters!: Record<string, unknown>;
}
