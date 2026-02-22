import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { Brand } from './entities/brand.entity';
import { BrandTranslate } from './entities/brand-translate.entity';
import { BrandImage } from './entities/brand-image.entity';
import { IsExist } from 'src/common/validators/isExist.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Brand, BrandTranslate, BrandImage])],
  controllers: [BrandController],
  providers: [BrandService, IsExist],
  exports: [BrandService],
})
export class BrandModule {}
