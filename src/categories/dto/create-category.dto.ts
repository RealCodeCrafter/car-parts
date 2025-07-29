import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  translations: {
    en: { name: string; description?: string };
    ru: { name: string; description?: string };
  };

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  parts?: number[];
}