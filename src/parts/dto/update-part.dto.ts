import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdatePartDto {
  @IsString()
  @IsOptional()
  sku?: string;

  @IsOptional()
  translations?: {
    en: { name?: string };
    ru: { name?: string };
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
  @IsOptional()
  trtCode?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsArray()
  @IsOptional()
  categories?: number[];
}