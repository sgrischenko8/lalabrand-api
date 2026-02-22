import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MeasurementTranslate } from './measurement-translate.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity()
export class Measurement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  custom_id: string;

  @Column()
  title: string;

  @Column()
  title_short: string;

  @OneToMany(() => MeasurementTranslate, (translate) => translate.entity_id)
  translates: MeasurementTranslate[];

  @OneToMany(() => Product, (product) => product.measurement_id)
  products: Product[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
