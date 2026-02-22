import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';
import { LANG } from 'src/common/enums/translation.enum';
import { applyTranslations } from 'src/common/utils/apply-translates.util';
import { CountryTranslate } from './entities/country-translate.entity';
import { CountryCreateTranslateDto } from './dto/country-create-translate.dto';
import { CountryUpdateTranslateDto } from './dto/country-update-translate.dto';

@Injectable()
export class CountryService {
  private readonly logger = new Logger(CountryService.name);

  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(CountryTranslate)
    private readonly entityTranslateRepo: Repository<CountryTranslate>,
  ) {}

  async create(dto: CreateCountryDto): Promise<Country> {
    const entity = this.countryRepo.create(dto);
    try {
      const savedEntity = await this.countryRepo.save(entity);
      return savedEntity;
    } catch (error) {
      this.logger.error(`Error creating country: ${error.message}`);
      throw new BadRequestException('NOT_CREATED');
    }
  }

  async findAll(
    take: number,
    skip: number,
    lang: LANG,
  ): Promise<{ entities: Country[]; count: number }> {
    const entities = await this.countryRepo.find({
      take,
      skip,
      order: { created_at: 'DESC' },
      relations: ['translates'],
    });

    const mappedEntities = applyTranslations([entities], lang);
    const count = await this.countryRepo.count();

    return { entities: mappedEntities[0], count };
  }

  async findOne(id: number, lang: LANG): Promise<Country> {
    const entity = await this.countryRepo.findOne({
      where: { id },
      relations: ['translates'],
    });

    if (!entity) throw new NotFoundException('country is NOT_FOUND');

    const mappedEntity = applyTranslations([entity], lang);
    return mappedEntity[0];
  }

  async update(id: number, dto: UpdateCountryDto): Promise<Country | null> {
    const result = await this.countryRepo.update(id, dto);

    if (result.affected === 0) throw new NotFoundException('country is NOT_FOUND');

    const entity = await this.countryRepo.findOne({ where: { id } });

    return entity;
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      const result = await this.countryRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('country is NOT_FOUND');
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('foreign key')) {
        throw new BadRequestException('HAS_CHILDS');
      }

      this.logger.error(`Error while deleting country \n ${err}`);
      throw err;
    }

    return { message: 'SUCCESS' };
  }

  async createTranslates(dto: CountryCreateTranslateDto[]): Promise<CountryTranslate[] | null> {
    if (dto?.length) {
      const results: CountryTranslate[] = [];

      for (const translate of dto) {
        const data = this.entityTranslateRepo.create(translate);
        const result = await this.entityTranslateRepo.save(data);

        results.push(result);
      }

      return results;
    }
    return null;
  }

  async updateTranslates(dto: CountryUpdateTranslateDto[]): Promise<CountryTranslate[] | null> {
    const results: CountryTranslate[] = [];

    for (const translate of dto) {
      const result = await this.entityTranslateRepo.update(translate.id, {
        ...translate,
      });

      if (result.affected === 0) throw new NotFoundException('country translate is NOT_FOUND');

      const updatedEntitiyTranslates = await this.entityTranslateRepo.findOne({
        where: { id: translate.id },
      });

      if (updatedEntitiyTranslates) results.push(updatedEntitiyTranslates);
    }

    return results;
  }

  async deleteTranslate(id: number): Promise<{ message: string } | NotFoundException> {
    const result = await this.entityTranslateRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('country translate is NOT_FOUND');
    }

    return { message: 'OK' };
  }
}
