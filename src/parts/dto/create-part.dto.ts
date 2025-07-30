import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreatePartDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNotEmpty()
  translations: {
    en: { name: string };
    ru: { name: string };
  };

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

  @IsArray()
  @IsOptional()
  years?: string[];

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