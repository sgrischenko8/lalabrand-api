import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryPromotionController } from './category-promotion.controller';
import { CategoryPromotion } from './entities/category-promotion.entity';
import { CategoryPromotionTranslate } from './entities/category-promotion-translate.entity';
import { CategoryPromotionService } from './category-promotion.service';
import { Category } from 'src/category/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryPromotion, CategoryPromotionTranslate, Category])],
  controllers: [CategoryPromotionController],
  providers: [CategoryPromotionService],
  exports: [CategoryPromotionService],
})
export class CategoryPromotionModule {}
