import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Country } from 'src/country/entities/country.entity';
import { BrandImage } from './brand-image.entity';
import { BrandTranslate } from './brand-translate.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity()
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  custom_id: string;

  @Column()
  title: string;

  @ManyToOne(() => Country, (country) => country.brand_ids)
  country_id: Country;

  @OneToMany(() => BrandImage, (image) => image.entity_id)
  images: BrandImage[];

  @OneToMany(() => Product, (brand) => brand.brand_id)
  products: Product[];

  @OneToMany(() => BrandTranslate, (translate) => translate.entity_id)
  translates: BrandTranslate[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
