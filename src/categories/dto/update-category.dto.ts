import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  translations?: {
    en: { name?: string; description?: string };
    ru: { name?: string; description?: string };
  };

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  parts?: number[];
}