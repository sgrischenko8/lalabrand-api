import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Product } from 'src/product/entities/product.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  custom_id: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 5.0 })
  rating: string;

  @ManyToOne(() => Product, (product) => product.ratings, {
    onDelete: 'CASCADE',
  })
  product_id: Product;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
