import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CountryTranslate } from './country-translate.entity';
import { Brand } from 'src/brand/entities/brand.entity';

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  custom_id: string;

  @Column()
  title: string;

  @OneToMany(() => Brand, (brand) => brand.country_id)
  brand_ids: Brand[];

  @OneToMany(() => CountryTranslate, (translate) => translate.entity_id)
  translates: CountryTranslate[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
