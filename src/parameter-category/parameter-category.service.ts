import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParameterCategory } from 'src/parameter-category/entities/parameter-category.entity';
import { ParameterCategoryCreateDto } from './dto/parameter-category-create.dto';
import { ParameterCategoryUpdateDto } from './dto/parameter-category-udapte.dto';
import { applyTranslations } from 'src/common/utils/apply-translates.util';
import { LANG } from 'src/common/enums/translation.enum';
import { ParameterCategoryUpdateTranslateDto } from './dto/parameter-category-update-translate.dto';
import { ParameterCategoryTranslate } from './entities/category-translate.entity';
import { ParameterCategoryCreateTranslateDto } from './dto/parameter-category-create-translate.dto';

@Injectable()
export class ParameterCategoryService {
  private readonly logger = new Logger(ParameterCategoryService.name);

  constructor(
    @InjectRepository(ParameterCategory)
    private readonly parameterCategoryRepo: Repository<ParameterCategory>,
    @InjectRepository(ParameterCategoryTranslate)
    private readonly entityTranslateRepo: Repository<ParameterCategoryTranslate>,
  ) {}

  async findAllList(lang: LANG): Promise<{ entities: ParameterCategory[] }> {
    const entities = await this.parameterCategoryRepo.find({
      order: { created_at: 'DESC' },
      relations: ['parameters', 'translates'],
    });

    const mappedEntities = applyTranslations(entities, lang);

    return { entities: mappedEntities };
  }

  async findAll(take: number, skip: number, lang: LANG) {
    const entities = await this.parameterCategoryRepo.find({
      take,
      skip,
      order: { created_at: 'DESC' },
      relations: ['parameters', 'translates'],
    });
    const count = await this.parameterCategoryRepo.count();

    const mappedEntities = applyTranslations(entities, lang);

    return { entities: mappedEntities, count };
  }

  async findOne(id: number, lang: LANG): Promise<ParameterCategory> {
    const entity = await this.parameterCategoryRepo.findOne({ where: { id } });

    if (!entity) throw new NotFoundException('parameter category is NOT_FOUND');

    const mappedCategory = applyTranslations([entity], lang);

    return mappedCategory[0];
  }

  async create(dto: ParameterCategoryCreateDto) {
    const newEntity = this.parameterCategoryRepo.create(dto);

    try {
      return await this.parameterCategoryRepo.save(newEntity);
    } catch (err) {
      this.logger.error(`Error while creating parameter category ${err}`);
      throw new BadRequestException('parameter category is NOT_CREATED');
    }
  }

  async update(id: number, dto: ParameterCategoryUpdateDto): Promise<ParameterCategory | null> {
    const result = await this.parameterCategoryRepo.update({ id }, dto);

    if (result.affected === 0) throw new NotFoundException('parameter category is NOT_FOUND');

    const updatedCategory = await this.parameterCategoryRepo.findOne({
      where: { id },
    });

    return updatedCategory;
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      const result = await this.parameterCategoryRepo.delete(id);

      if (result.affected === 0) throw new NotFoundException('parameter category is NOT_FOUND');
    } catch (err) {
      if (err instanceof Error && err.message.includes('foreign key')) {
        this.logger.error(
          `Cannot delete parameter category with id ${id} because it is associated with one or more products: ${err}`,
        );
        throw new BadRequestException('parameter category HAS_CHILDS');
      }

      this.logger.error(`Error while deleting parameter category with id ${id}: ${err}`);

      throw err;
    }

    return { message: 'SUCCESS' };
  }

  async createTranslates(
    dto: ParameterCategoryCreateTranslateDto[],
  ): Promise<ParameterCategoryTranslate[] | null> {
    if (dto?.length) {
      const results: ParameterCategoryTranslate[] = [];

      for (const translate of dto) {
        const data = this.entityTranslateRepo.create(translate);
        const result = await this.entityTranslateRepo.save(data);
        results.push(result);
      }

      return results;
    }
    return null;
  }

  async updateTranslates(
    dto: ParameterCategoryUpdateTranslateDto[],
  ): Promise<ParameterCategoryTranslate[] | null> {
    const results: ParameterCategoryTranslate[] = [];

    for (const translate of dto) {
      console.log(translate);
      const result = await this.entityTranslateRepo.update(translate.id, {
        ...translate,
      });

      if (result.affected === 0)
        throw new NotFoundException('parameter category translate is NOT_FOUND');

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
      throw new NotFoundException('parameter category translate is NOT_FOUND');
    }

    return { message: 'OK' };
  }
}
