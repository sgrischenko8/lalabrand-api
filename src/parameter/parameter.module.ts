import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parameter } from './entities/parameter.entity';
import { ParameterController } from './parameter.controller';
import { ParameterService } from './parameter.service';
import { ParameterCategoryModule } from 'src/parameter-category/parameter-category.module';
import { ParameterCategory } from 'src/parameter-category/entities/parameter-category.entity';
import { ParameterTranslate } from './entities/category-translate.entity';
import { IsExistIdInArray } from 'src/common/validators/isExistIdInArray.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parameter, ParameterCategory, ParameterTranslate]),
    ParameterCategoryModule,
  ],
  controllers: [ParameterController],
  providers: [ParameterService, IsExistIdInArray],
  exports: [ParameterService],
})
export class ParameterModule {}
