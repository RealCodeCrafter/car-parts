import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Part } from './entities/part.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { Category } from '../categories/entities/category.entity';
import * as path from 'path';
import * as fs from 'fs';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part)
    private readonly partsRepository: Repository<Part>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly i18n: I18nService,
  ) {
    const uploadDir = join(__dirname, '..', 'Uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir);
    }
  }

  async handleFileUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(await this.i18n.translate('parts.image_not_uploaded'));
    }
    const fileUrl = `https://car-parts-1.onrender.com/products/uploads/${file.filename}`;
    return { message: await this.i18n.translate('parts.image_uploaded'), fileUrl };
  }

  async create(createPartDto: CreatePartDto, lang: string = 'en') {
    const existingPart = await this.partsRepository.findOne({
      where: { trtCode: createPartDto.trtCode },
    });

    if (existingPart) {
      throw new BadRequestException(
        await this.i18n.translate('parts.part_exists', { args: { trtCode: createPartDto.trtCode } }),
      );
    }

    const categories = createPartDto.categories
      ? await this.categoriesRepository.findByIds(createPartDto.categories)
      : [];

    if (createPartDto.categories && (!categories || categories.length === 0)) {
      throw new NotFoundException(await this.i18n.translate('parts.category_not_found'));
    }

    const part = this.partsRepository.create({
      ...createPartDto,
      categories,
    });

    const savedPart = await this.partsRepository.save(part);
    return {
      id: savedPart.id,
      sku: savedPart.sku,
      name: savedPart.translations[lang]?.name || savedPart.translations.en.name,
      shortDescription: savedPart.translations[lang]?.shortDescription || savedPart.translations.en.shortDescription,
      description: savedPart.translations[lang]?.description || savedPart.translations.en.description,
      visibilityInCatalog: savedPart.visibilityInCatalog,
      translationGroup: savedPart.translationGroup,
      inStock: savedPart.inStock,
      images: savedPart.images,
      carName: savedPart.carName,
      model: savedPart.model,
      oem: savedPart.oem,
      years: savedPart.years,
      price: savedPart.price,
      imageUrl: savedPart.imageUrl,
      trtCode: savedPart.trtCode,
      brand: savedPart.brand,
      categories: savedPart.categories.map(category => ({
        id: category.id,
        name: category.translations[lang]?.name || category.translations.en.name,
        description: category.translations[lang]?.description || category.translations.en.description,
        imageUrl: category.imageUrl,
      })),
    };
  }

  async findAll(lang: string = 'en') {
    const parts = await this.partsRepository.find({
      relations: ['categories'],
      order: { id: 'ASC' },
    });

    if (!parts.length) {
      throw new NotFoundException(await this.i18n.translate('parts.no_parts'));
    }

    return parts.map(part => ({
      id: part.id,
      sku: part.sku,
      name: part.translations[lang]?.name || part.translations.en.name,
      shortDescription: part.translations[lang]?.shortDescription || part.translations.en.shortDescription,
      description: part.translations[lang]?.description || part.translations.en.description,
      visibilityInCatalog: part.visibilityInCatalog,
      inStock: part.inStock,
      images: part.images,
      carName: part.carName,
      model: part.model,
      oem: part.oem,
      years: part.years,
      price: part.price,
      imageUrl: part.imageUrl,
      trtCode: part.trtCode,
      brand: part.brand,
      categories: part.categories.map(category => ({
        id: category.id,
        name: category.translations[lang]?.name || category.translations.en.name,
        description: category.translations[lang]?.description || category.translations.en.description,
        imageUrl: category.imageUrl,
      })),
    }));
  }

  async findOne(id: number, lang: string = 'en') {
    const part = await this.partsRepository.findOne({ where: { id }, relations: ['categories'] });
    if (!part) {
      throw new NotFoundException(
        await this.i18n.translate('parts.part_not_found', { args: { id } }),
      );
    }
    return {
      id: part.id,
      sku: part.sku,
      name: part.translations[lang]?.name || part.translations.en.name,
      shortDescription: part.translations[lang]?.shortDescription || part.translations.en.shortDescription,
      description: part.translations[lang]?.description || part.translations.en.description,
      visibilityInCatalog: part.visibilityInCatalog,
      inStock: part.inStock,
      images: part.images,
      carName: part.carName,
      model: part.model,
      oem: part.oem,
      years: part.years,
      price: part.price,
      imageUrl: part.imageUrl,
      trtCode: part.trtCode,
      brand: part.brand,
      categories: part.categories.map(category => ({
        id: category.id,
        name: category.translations[lang]?.name || category.translations.en.name,
        description: category.translations[lang]?.description || category.translations.en.description,
        imageUrl: category.imageUrl,
      })),
    };
  }

  async update(id: number, updatePartDto: UpdatePartDto, lang: string = 'en') {
    const part = await this.partsRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!part) {
      throw new NotFoundException(
        await this.i18n.translate('parts.part_not_found', { args: { id } }),
      );
    }

    if (updatePartDto.translations) {
      part.translations = {
        en: {
          name: updatePartDto.translations.en?.name || part.translations.en.name,
          shortDescription: updatePartDto.translations.en?.shortDescription || part.translations.en.shortDescription,
          description: updatePartDto.translations.en?.description || part.translations.en.description,
        },
        ru: {
          name: updatePartDto.translations.ru?.name || part.translations.ru.name,
          shortDescription: updatePartDto.translations.ru?.shortDescription || part.translations.ru.shortDescription,
          description: updatePartDto.translations.ru?.description || part.translations.ru.description,
        },
      };
    }

    part.sku = updatePartDto.sku || part.sku;
    part.visibilityInCatalog = updatePartDto.visibilityInCatalog || part.visibilityInCatalog;
    part.translationGroup = updatePartDto.translationGroup || part.translationGroup;
    part.inStock = updatePartDto.inStock ?? part.inStock;
    part.images = updatePartDto.images || part.images;
    part.carName = updatePartDto.carName || part.carName;
    part.model = updatePartDto.model || part.model;
    part.oem = updatePartDto.oem || part.oem;
    part.years = updatePartDto.years || part.years;
    part.price = updatePartDto.price ?? part.price;
    part.imageUrl = updatePartDto.imageUrl || part.imageUrl;
    part.trtCode = updatePartDto.trtCode || part.trtCode;
    part.brand = updatePartDto.brand || part.brand;

    if (updatePartDto.categories) {
      part.categories = await this.categoriesRepository.findByIds(updatePartDto.categories);
    }

    const updatedPart = await this.partsRepository.save(part);
    return {
      id: updatedPart.id,
      sku: updatedPart.sku,
      name: updatedPart.translations[lang]?.name || updatedPart.translations.en.name,
      shortDescription: updatedPart.translations[lang]?.shortDescription || updatedPart.translations.en.shortDescription,
      description: updatedPart.translations[lang]?.description || updatedPart.translations.en.description,
      visibilityInCatalog: updatedPart.visibilityInCatalog,
      translationGroup: updatedPart.translationGroup,
      inStock: updatedPart.inStock,
      images: updatedPart.images,
      carName: updatedPart.carName,
      model: updatedPart.model,
      oem: updatedPart.oem,
      years: updatedPart.years,
      price: updatedPart.price,
      imageUrl: updatedPart.imageUrl,
      trtCode: updatedPart.trtCode,
      brand: updatedPart.brand,
      categories: updatedPart.categories.map(category => ({
        id: category.id,
        name: category.translations[lang]?.name || category.translations.en.name,
        description: category.translations[lang]?.description || category.translations.en.description,
        imageUrl: category.imageUrl,
      })),
    };
  }

  async remove(id: number) {
    const existingPart = await this.partsRepository.findOne({ where: { id } });
    if (!existingPart) {
      throw new NotFoundException(
        await this.i18n.translate('parts.part_not_found', { args: { id } }),
      );
    }
    await this.partsRepository.delete(id);
    return { message: await this.i18n.translate('parts.part_delete_success') };
  }

  async getPartsByCategory(categoryId: number, lang: string = 'en') {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
      relations: ['parts'],
    });

    if (!category) {
      throw new NotFoundException(await this.i18n.translate('parts.category_not_found'));
    }

    return {
      category: {
        id: category.id,
        name: category.translations[lang]?.name || category.translations.en.name,
        description: category.translations[lang]?.description || category.translations.en.description,
        imageUrl: category.imageUrl,
      },
      parts: category.parts.map(part => ({
        id: part.id,
        sku: part.sku,
        name: part.translations[lang]?.name || part.translations.en.name,
        shortDescription: part.translations[lang]?.shortDescription || part.translations.en.shortDescription,
        description: part.translations[lang]?.description || part.translations.en.description,
        visibilityInCatalog: part.visibilityInCatalog,
        translationGroup: part.translationGroup,
        inStock: part.inStock,
        images: part.images,
        carName: part.carName,
        model: part.model,
        oem: part.oem,
        years: part.years,
        price: part.price,
        imageUrl: part.imageUrl,
        trtCode: part.trtCode,
        brand: part.brand,
      })),
    };
  }

  async getAllOem() {
    const distinctOems = await this.partsRepository
      .createQueryBuilder('part')
      .select('DISTINCT part.oem')
      .getRawMany();

    return distinctOems.map((oem) => oem.oem).filter(Boolean);
  }

  async getOemId(oem: string) {
    const trts = await this.partsRepository
      .createQueryBuilder('part')
      .select('DISTINCT part.trtCode')
      .where('part.oem = :oem', { oem })
      .getRawMany();
    return trts.map((trt) => trt.trtCode);
  }

  async getTrtCode(trt: string) {
    const brands = await this.partsRepository
      .createQueryBuilder('part')
      .select('DISTINCT part.brand')
      .where('part.trtCode = :trt', { trt })
      .getRawMany();
    return brands.map((brand) => brand.brand);
  }

  async getBrand(brand: string) {
    const models = await this.partsRepository
      .createQueryBuilder('part')
      .select('DISTINCT part.model')
      .where('part.brand = :brand', { brand })
      .getRawMany();
    return models.map((model) => model.model).filter(Boolean);
  }

  async search(oem: string, trt: string, brand: string, model: string, lang: string = 'en') {
    const queryBuilder = this.partsRepository.createQueryBuilder('part');

    if (oem) queryBuilder.andWhere('LOWER(part.oem) = LOWER(:oem)', { oem: oem.toLowerCase() });
    if (trt) queryBuilder.andWhere('LOWER(part.trtCode) = LOWER(:trt)', { trt: trt.toLowerCase() });
    if (brand) queryBuilder.andWhere('LOWER(part.brand) = LOWER(:brand)', { brand: brand.toLowerCase() });
    if (model) queryBuilder.andWhere('LOWER(part.model) = LOWER(:model)', { model: model.toLowerCase() });

    const parts = await queryBuilder.getMany();
    return parts.map(part => ({
      id: part.id,
      sku: part.sku,
      name: part.translations[lang]?.name || part.translations.en.name,
      shortDescription: part.translations[lang]?.shortDescription || part.translations.en.shortDescription,
      description: part.translations[lang]?.description || part.translations.en.description,
      visibilityInCatalog: part.visibilityInCatalog,
      translationGroup: part.translationGroup,
      inStock: part.inStock,
      images: part.images,
      carName: part.carName,
      model: part.model,
      oem: part.oem,
      years: part.years,
      price: part.price,
      imageUrl: part.imageUrl,
      trtCode: part.trtCode,
      brand: part.brand,
      categories: part.categories.map(category => ({
        id: category.id,
        name: category.translations[lang]?.name || category.translations.en.name,
        description: category.translations[lang]?.description || category.translations.en.description,
        imageUrl: category.imageUrl,
      })),
    }));
  }

  async getCategories(lang: string = 'en') {
    const categories = await this.categoriesRepository.find();
    if (categories.length === 0) {
      throw new NotFoundException(await this.i18n.translate('parts.no_categories'));
    }
    return categories.map(category => ({
      id: category.id,
      name: category.translations[lang]?.name || category.translations.en.name,
      description: category.translations[lang]?.description || category.translations.en.description,
      imageUrl: category.imageUrl,
    }));
  }

  async searchByName(name: string, lang: string = 'en') {
    const parts = await this.partsRepository
      .createQueryBuilder('part')
      .where('LOWER(part.translations->>\'en\'->>\'name\') LIKE LOWER(:name) OR LOWER(part.translations->>\'ru\'->>\'name\') LIKE LOWER(:name)', {
        name: `%${name.toLowerCase()}%`,
      })
      .getMany();

    if (parts.length === 0) {
      throw new NotFoundException(
        await this.i18n.translate('parts.part_not_found', { args: { id: name } }),
      );
    }

    return parts.map(part => ({
      id: part.id,
      sku: part.sku,
      name: part.translations[lang]?.name || part.translations.en.name,
      shortDescription: part.translations[lang]?.shortDescription || part.translations.en.shortDescription,
      description: part.translations[lang]?.description || part.translations.en.description,
      visibilityInCatalog: part.visibilityInCatalog,
      translationGroup: part.translationGroup,
      inStock: part.inStock,
      images: part.images,
      carName: part.carName,
      model: part.model,
      oem: part.oem,
      years: part.years,
      price: part.price,
      imageUrl: part.imageUrl,
      trtCode: part.trtCode,
      brand: part.brand,
      categories: part.categories.map(category => ({
        id: category.id,
        name: category.translations[lang]?.name || category.translations.en.name,
        description: category.translations[lang]?.description || category.translations.en.description,
        imageUrl: category.imageUrl,
      })),
    }));
  }

  async getTotalCount() {
    const totalCount = await this.partsRepository.count();
    return { total: totalCount };
  }

  async getImagePath(imageName: string): Promise<string | null> {
    if (!imageName) {
      return null;
    }
    const imagePath = path.join(__dirname, '..', '..', 'Uploads', imageName);
    if (fs.existsSync(imagePath)) {
      return imagePath;
    }
    throw new NotFoundException(await this.i18n.translate('parts.image_not_found'));
  }
}