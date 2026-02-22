import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CategoryPromotionTranslate } from './category-promotion-translate.entity';
import { Category } from 'src/category/entities/category.entity';

@Entity()
export class CategoryPromotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  custom_id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  from_amount: string;

  @Column()
  discount: number;

  @Column()
  priority: number;

  @OneToMany(() => CategoryPromotionTranslate, (translate) => translate.entity_id)
  translates: CategoryPromotionTranslate[];

  @OneToMany(() => Category, (category) => category.promotion_id)
  categories: Category[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
