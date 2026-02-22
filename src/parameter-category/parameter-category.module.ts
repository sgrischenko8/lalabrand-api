import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParameterCategoryController } from './parameter-category.controller';
import { ParameterCategoryService } from './parameter-category.service';
import { ParameterCategory } from 'src/parameter-category/entities/parameter-category.entity';
import { ParameterCategoryTranslate } from './entities/category-translate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParameterCategory, ParameterCategoryTranslate])],
  controllers: [ParameterCategoryController],
  providers: [ParameterCategoryService],
  exports: [ParameterCategoryService],
})
export class ParameterCategoryModule {}
