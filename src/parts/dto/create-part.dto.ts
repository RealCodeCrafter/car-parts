import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';

export class CreatePartDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNotEmpty()
  translations: {
    en: { name: string; shortDescription?: string; description?: string };
    ru: { name: string; shortDescription?: string; description?: string };
  };

  @IsString()
  @IsNotEmpty()
  visibilityInCatalog: string;
  
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
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  trtCode: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsArray()
  @IsOptional()
  categories?: number[];
}