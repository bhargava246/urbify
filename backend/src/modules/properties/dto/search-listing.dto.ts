import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FurnishingStatus, ListingType } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum SortBy {
  NEWEST = 'NEWEST',
  PRICE_ASC = 'PRICE_ASC',
  PRICE_DESC = 'PRICE_DESC',
  AREA_ASC = 'AREA_ASC',
  AREA_DESC = 'AREA_DESC',
}

export class SearchListingDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly locality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly pincode?: string;

  @ApiPropertyOptional({ enum: ListingType })
  @IsOptional()
  @IsEnum(ListingType)
  readonly listingType?: ListingType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  readonly bhk?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly minArea?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly maxArea?: number;

  @ApiPropertyOptional({ enum: FurnishingStatus })
  @IsOptional()
  @IsEnum(FurnishingStatus)
  readonly furnishingStatus?: FurnishingStatus;

  @ApiPropertyOptional({ enum: SortBy })
  @IsOptional()
  @IsEnum(SortBy)
  readonly sortBy?: SortBy;

  // ── Geospatial / proximity search ──────────────────────────────────────────
  @ApiPropertyOptional({ description: 'Centre latitude for proximity search', example: 12.9352 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly lat?: number;

  @ApiPropertyOptional({ description: 'Centre longitude for proximity search', example: 77.6245 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly lng?: number;

  @ApiPropertyOptional({ description: 'Search radius in kilometres (requires lat + lng)', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(50)
  readonly radiusKm?: number;
}
