import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandCreateDto } from './dto/brand-create.dto';
import { BrandUpdateDto } from './dto/brand-update.dto';
import { BrandTranslate } from './entities/brand-translate.entity';
import { BrandCreateTranslateDto } from './dto/brand-create-translate.dto';
import { BrandUpdateTranslateDto } from './dto/brand-update-translate.dto';
import { BrandCreateImageDto } from './dto/brand-create-image.dto';
import { BrandImage } from './entities/brand-image.entity';
import { LANG } from 'src/common/enums/translation.enum';
import { applyTranslations } from 'src/common/utils/apply-translates.util';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandService {
  private readonly logger = new Logger(BrandService.name);

  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @InjectRepository(BrandTranslate)
    private readonly entityTranslateRepo: Repository<BrandTranslate>,
    @InjectRepository(BrandImage)
    private readonly entityImageRepo: Repository<BrandImage>,
  ) {}

  async findOne(id: number, lang: LANG): Promise<Brand | null> {
    const entity = await this.brandRepo.findOne({
      where: { id },
      relations: ['images', 'translates'],
    });

    if (!entity) throw new NotFoundException('entity of brand is NOT_FOUND');

    const mappedEntity = applyTranslations([entity], lang);

    return mappedEntity[0];
  }

  async create(dto: BrandCreateDto): Promise<Brand> {
    const data = this.brandRepo.create(dto);

    try {
      return await this.brandRepo.save(data);
    } catch (error) {
      this.logger.error(`Error creating brand: ${error}`);
      throw new BadRequestException('entity of brand is NOT_CREATED');
    }
  }

  async findAllList(lang: LANG): Promise<{ entities: Brand[] }> {
    const entities = await this.brandRepo.find({
      order: { created_at: 'DESC' },
      relations: ['images', 'translates'],
    });

    const mappedEntities = applyTranslations(entities, lang);

    return { entities: mappedEntities };
  }

  async findAll(
    take: number,
    skip: number,
    lang: LANG,
  ): Promise<{ entities: Brand[]; count: number }> {
    const entities = await this.brandRepo.find({
      take,
      skip,
      order: { created_at: 'DESC' },
      relations: ['translates', 'images'],
    });

    const mappedEntities = applyTranslations(entities, lang);

    const count = await this.brandRepo.count();

    return { entities: mappedEntities, count };
  }

  async update(id: number, dto: BrandUpdateDto): Promise<Brand | null> {
    const result = await this.brandRepo.update(id, { ...dto });

    if (result.affected === 0) throw new NotFoundException('entity of brand is NOT_FOUND');

    const updatedCategory = await this.brandRepo.findOne({
      where: { id },
    });

    return updatedCategory;
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      const result = await this.brandRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('entity of brand is NOT_FOUND');
      } else {
        await this.deleteImages(id);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('foreign key')) {
        throw new BadRequestException('entity of brand HAS_CHILDS');
      }
      this.logger.error(`Error while deleting brand \n ${err}`);
      throw err;
    }

    return { message: 'SUCCESS' };
  }

  async createTranslates(dto: BrandCreateTranslateDto[]): Promise<BrandTranslate[] | null> {
    if (dto?.length) {
      const results: BrandTranslate[] = [];

      for (const translate of dto) {
        console.log(translate);

        const data = this.entityTranslateRepo.create(translate);
        const result = await this.entityTranslateRepo.save(data);
        results.push(result);
      }

      return results;
    }
    return null;
  }

  async updateTranslates(dto: BrandUpdateTranslateDto[]): Promise<BrandTranslate[] | null> {
    const results: BrandTranslate[] = [];

    for (const translate of dto) {
      const result = await this.entityTranslateRepo.update(translate.id, {
        ...translate,
      });

      if (result.affected === 0) throw new NotFoundException('entity of brand is NOT_FOUND');

      const updatedEntityTranslate = await this.entityTranslateRepo.findOne({
        where: { id: translate.id },
      });

      if (updatedEntityTranslate) results.push(updatedEntityTranslate);
    }

    return results;
  }

  async deleteTranslate(id: number): Promise<{ message: string } | NotFoundException> {
    const result = await this.entityTranslateRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('entity of brand is NOT_FOUND');
    }

    return { message: 'OK' };
  }

  async createImage(dto: BrandCreateImageDto): Promise<BrandImage> {
    const entity_id = typeof dto.entity_id === 'number' ? { id: dto.entity_id } : dto.entity_id;

    const newImage = this.entityImageRepo.create({
      ...dto,
      entity_id,
    });
    return await this.entityImageRepo.save(newImage);
  }

  async uploadImages(
    files: Express.Multer.File[],
    entity_id: number,
  ): Promise<{ message: string }> {
    const isBrandExist = await this.brandRepo.findOne({
      where: { id: entity_id },
    });

    if (!isBrandExist) throw new NotFoundException('entity of brand is NOT_FOUND');

    const fileName = `${Date.now()}.webp`;

    const uploadDir = path.join(process.cwd(), 'uploads', 'brand');
    await fs.ensureDir(uploadDir);

    const outputFilePath = path.join(uploadDir, fileName);

    for (const file of files) {
      try {
        await sharp(file.buffer).avif().toFile(outputFilePath);

        const body: BrandCreateImageDto = {
          custom_id: '',
          name: fileName,
          path: outputFilePath,
          entity_id: entity_id,
        };

        try {
          await this.createImage(body);
        } catch (err) {
          this.logger.warn(`Error to create image for entity_id: ${entity_id}: ${err}`);
          throw new BadRequestException('entity of brand image is NOT_CREATED');
        }
      } catch (err) {
        this.logger.warn(`Error to upload file ${fileName}: ${err}`);
        throw new BadRequestException('image of brand is NOT_UPLOADED');
      }
    }

    return {
      message: 'Images saved',
    };
  }

  async deleteImage(id: number): Promise<void> {
    const image = await this.entityImageRepo.findOne({ where: { id } });

    if (!image) throw new NotFoundException('entity of brand is NOT_FOUND');

    try {
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      } else {
        this.logger.warn(`File at path ${image.path} does not exist`);
      }
    } catch (err) {
      this.logger.error(`Failed to delete file at path ${image.path}: ${err}`);
    }

    await this.entityImageRepo.delete(id);
  }

  async deleteImages(entity_id: number): Promise<{ message: string } | void> {
    const deleteCandidates = await this.entityImageRepo.find({
      where: { entity_id: { id: entity_id } },
    });

    if (deleteCandidates?.length) {
      const filePathList = deleteCandidates.map((field) => field.path);

      for (const filePath of filePathList) {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          } else {
            this.logger.warn(`File at path ${filePath} does not exist`);
          }
        } catch (err) {
          this.logger.error(`Failed to delete file at path ${filePath}: ${err}`);
        }
      }
    }
  }
}
