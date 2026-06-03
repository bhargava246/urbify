import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FurnishingStatus, ListingType, PropertyFacing } from '@prisma/client';

export class CreateListingDto {
  @ApiProperty({ enum: ListingType })
  @IsEnum(ListingType)
  readonly listingType!: ListingType;

  @ApiProperty({ example: 'Koramangala' })
  @IsString()
  @IsNotEmpty()
  readonly locality!: string;

  @ApiPropertyOptional({ example: 'Near Forum Mall' })
  @IsOptional()
  @IsString()
  readonly landmark?: string;

  @ApiProperty({ example: 'Bangalore' })
  @IsString()
  @IsNotEmpty()
  readonly city!: string;

  @ApiProperty({ example: 'Karnataka' })
  @IsString()
  @IsNotEmpty()
  readonly state!: string;

  @ApiProperty({ example: '560034' })
  @IsString()
  @IsNotEmpty()
  readonly pincode!: string;

  @ApiProperty({ example: '123, 5th Cross, Koramangala 4th Block, Bangalore 560034' })
  @IsString()
  @IsNotEmpty()
  readonly fullAddress!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly longitude?: number;

  @ApiProperty({ example: '2 BHK Apartment for Rent in Koramangala' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  readonly title!: string;

  @ApiProperty({ example: 'Spacious 2 BHK with balcony and car parking...' })
  @IsString()
  @IsNotEmpty()
  readonly description!: string;

  @ApiProperty({ example: 'apartment' })
  @IsString()
  @IsNotEmpty()
  readonly propertySubType!: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  readonly bhk?: number;

  @ApiProperty({ example: 1200 })
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  readonly areaSqFt!: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly floor?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly totalFloors?: number;

  @ApiPropertyOptional({ enum: PropertyFacing })
  @IsOptional()
  @IsEnum(PropertyFacing)
  readonly facing?: PropertyFacing;

  @ApiPropertyOptional({ description: 'Age of property in years' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly propertyAge?: number;

  @ApiPropertyOptional({ enum: FurnishingStatus })
  @IsOptional()
  @IsEnum(FurnishingStatus)
  readonly furnishingStatus?: FurnishingStatus;

  @ApiProperty({ example: 25000, description: 'Monthly rent or sale price in INR' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly rentOrPrice!: number;

  @ApiPropertyOptional({ example: 75000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly securityDeposit?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly maintenanceCharge?: number;

  @ApiProperty({ example: '2024-08-01' })
  @IsDateString()
  readonly availableFrom!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  readonly isNegotiable?: boolean;

  @ApiPropertyOptional({ example: 'https://youtube.com/...' })
  @IsOptional()
  @IsString()
  readonly videoUrl?: string;

  @ApiPropertyOptional({ type: [String], example: ['Power Backup', 'Gym', 'Swimming Pool'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly amenities?: string[];
}
