import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from 'src/product/entities/product.entity';

@Entity()
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  custom_id: string;

  @Column()
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount_retial: string;

  @OneToOne(() => Product, (product) => product.stock, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_stock' })
  product: Product;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
