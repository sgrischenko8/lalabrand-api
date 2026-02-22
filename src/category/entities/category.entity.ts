import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Product } from 'src/product/entities/product.entity';
import { CategoryTranslate } from './category-translate.entity';
import { CategoryImage } from './category-image.entity';
import { CategoryPromotion } from 'src/category-promotion/entities/category-promotion.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  show_on_main_page: boolean;

  @Column({ unique: true })
  title: string;

  @Column()
  url: string;

  @Column({ default: false })
  is_packages: boolean;

  @OneToMany(() => Product, (product) => product.category_id)
  products: Product[];

  @OneToMany(() => CategoryTranslate, (translate) => translate.entity_id)
  translates: CategoryTranslate[];

  @OneToMany(() => CategoryImage, (image) => image.entity_id)
  images: CategoryImage[];

  @ManyToOne(() => CategoryPromotion, (promotion) => promotion.categories)
  promotion_id: CategoryPromotion;

  @Column({ default: 0 })
  order_in_list: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
