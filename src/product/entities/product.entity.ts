import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { CartItem } from 'src/cart/entities/cart-item.entity';
import { Parameter } from 'src/parameter/entities/parameter.entity';
import { ProductTranslate } from './product-translate.entity';
import { ProductImage } from './product-image.entity';
import { Rating } from 'src/product-rating/entities/rating.entity';
import { Stock } from 'src/product-stock/entities/stock.entity';
import { Brand } from 'src/brand/entities/brand.entity';
import { Measurement } from 'src/measurement/entities/measurement.entity';
import { ProductPromotion } from 'src/product-promotion/entities/product-promotion.entity';
import { OrderItem } from 'src/order/entities/order-item.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  custom_id: string;

  @Column()
  is_top_product: boolean;

  @Column()
  is_hidden: boolean;

  @Column()
  is_parent: boolean;

  @Column()
  article: string;

  @Column()
  title: string;

  @Column()
  seo_title: string;

  @Column({ type: 'text', default: '' })
  seo_description: string;

  @Column()
  url: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price_retail: string;

  @Column({ type: 'text' })
  description_1: string;

  @Column({ type: 'text' })
  description_2: string;

  @Column({ type: 'text' })
  description_3: string;

  @Column({ type: 'text' })
  description_4: string;

  @Column({ default: 0 })
  order_in_list: number;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product_id)
  cart_item_id: CartItem[];

  @ManyToOne(() => Product, (product) => product.parent_id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent_id: Product;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category_id: Category;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'brand_id' })
  brand_id: Brand;

  @ManyToOne(() => Measurement, (measurement) => measurement.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'measurement' })
  measurement_id: Measurement;

  @ManyToOne(() => ProductPromotion, (promotion) => promotion.products, {
    onDelete: 'SET NULL',
  })
  promotion_id: ProductPromotion;

  @ManyToMany(() => Parameter, (parameter) => parameter.products, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'product_parameters',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'parameter_id', referencedColumnName: 'id' },
  })
  parameters: Parameter[];

  @OneToMany(() => ProductTranslate, (translate) => translate.entity_id)
  translates: ProductTranslate[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product_id)
  order_item_ids: OrderItem[];

  @OneToMany(() => ProductImage, (image) => image.entity_id)
  images: ProductImage[];

  @OneToMany(() => Rating, (rating) => rating.product_id)
  ratings: Rating[];

  @OneToOne(() => Stock, (stock) => stock.product)
  stock: Stock;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  rating?: number;
}
