import { IsString, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';

export class UpdatePartDto {
  @IsString()
  @IsOptional()
  sku?: string;

  @IsOptional()
  translations?: {
    en: { name?: string; shortDescription?: string; description?: string };
    ru: { name?: string; shortDescription?: string; description?: string };
  };

  @IsString()
  @IsOptional()
  visibilityInCatalog?: string;

  @IsString()
  @IsOptional()
  translationGroup?: string;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  carName?: string;

  @IsArray()
  @IsOptional()
  model?: string[];

  @IsArray()
  @IsOptional()
  oem?: string[];

  @IsString()
  @IsOptional()
  years?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  trtCode?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsArray()
  @IsOptional()
  categories?: number[];
}