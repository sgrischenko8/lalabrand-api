import { LANG } from 'src/common/enums/translation.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryPromotion } from './category-promotion.entity';

@Entity()
export class CategoryPromotionTranslate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  custom_id: string;

  @Column()
  field: string;

  @Column()
  value: string;

  @Column({ type: 'enum', enum: LANG })
  lang: LANG;

  @ManyToOne(() => CategoryPromotion, (promotion) => promotion.translates, {
    onDelete: 'CASCADE',
  })
  entity_id: CategoryPromotion;
}
