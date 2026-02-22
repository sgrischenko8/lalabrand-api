import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Parameter } from './entities/parameter.entity';
import { ParameterDto } from './dto/parameter.dto';
import { ParameterCategory } from 'src/parameter-category/entities/parameter-category.entity';
import { ParameterTranslate } from './entities/category-translate.entity';
import { ParameterCreateTranslateDto } from './dto/parameter-create-translate.dto';
import { ParameterUpdateTranslateDto } from './dto/parameter-update-translate.dto';
import { applyTranslations } from 'src/common/utils/apply-translates.util';
import { LANG } from 'src/common/enums/translation.enum';

@Injectable()
export class ParameterService {
  private readonly logger = new Logger(ParameterService.name);

  constructor(
    @InjectRepository(Parameter)
    private readonly parameterRepo: Repository<Parameter>,
    @InjectRepository(ParameterCategory)
    private readonly parameterCategoryRepo: Repository<ParameterCategory>,
    @InjectRepository(ParameterTranslate)
    private readonly entityTranslateRepo: Repository<ParameterTranslate>,
  ) {}

  async findAll(
    take: number,
    skip: number,
    lang: LANG,
  ): Promise<{ entities: Parameter[]; count: number }> {
    const entities = await this.parameterRepo.find({
      take,
      skip,
      order: { created_at: 'DESC' },
      relations: ['category_ids', 'translates'],
    });

    const count = await this.parameterRepo.count();

    const mappedEntities = applyTranslations(entities, lang);

    return { entities: mappedEntities, count };
  }

  async findOne(id: number, lang: LANG): Promise<Parameter> {
    const entity = await this.parameterRepo.findOne({
      where: { id },
      relations: ['category_ids', 'translates'],
    });
    if (!entity) throw new NotFoundException('parameter is NOT_FOUND');

    const mappedEntity = applyTranslations([entity], lang);

    return mappedEntity[0];
  }

  async create(dto: ParameterDto): Promise<Parameter> {
    const { category_ids, ...rest } = dto;
    const parameter = this.parameterRepo.create(rest);

    if (category_ids?.length) {
      const categories = await this.parameterCategoryRepo.find({
        where: { id: In(category_ids) },
      });
      parameter.category_ids = categories;
    }

    try {
      return await this.parameterRepo.save(parameter);
    } catch (err) {
      this.logger.error(`Error while creating parameter ${err}`);
      throw new BadRequestException('NOT_CREATED');
    }
  }

  async update(id: number, dto: ParameterDto): Promise<Parameter> {
    const parameter = await this.parameterRepo.findOne({
      where: { id },
      relations: ['category_ids', 'translates'],
    });
    if (!parameter) throw new NotFoundException('parameter is NOT_FOUND');

    Object.assign(parameter, dto);

    if (dto.category_ids) {
      const categories = await this.parameterCategoryRepo.find({
        where: { id: In(dto.category_ids) },
      });
      parameter.category_ids = categories;
    }

    await this.parameterRepo.save(parameter);
    return parameter;
  }

  async delete(id: number): Promise<{ message: string }> {
    const result = await this.parameterRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('parameter is NOT_FOUND');
    }

    return { message: 'SUCCESS' };
  }

  async createTranslates(dto: ParameterCreateTranslateDto[]): Promise<ParameterTranslate[] | null> {
    if (dto?.length) {
      const results: ParameterTranslate[] = [];

      for (const translate of dto) {
        const data = this.entityTranslateRepo.create(translate);
        const result = await this.entityTranslateRepo.save(data);
        results.push(result);
      }

      return results;
    }
    return null;
  }

  async updateTranslates(dto: ParameterUpdateTranslateDto[]): Promise<ParameterTranslate[] | null> {
    const results: ParameterTranslate[] = [];

    for (const translate of dto) {
      const result = await this.entityTranslateRepo.update(translate.id, {
        ...translate,
      });

      if (result.affected === 0) throw new NotFoundException('parameter translate is NOT_FOUND');

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
      throw new NotFoundException('parameter translate is NOT_FOUND');
    }

    return { message: 'OK' };
  }
}
