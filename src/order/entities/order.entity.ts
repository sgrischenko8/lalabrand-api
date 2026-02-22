import { User } from 'src/user/entities/user.entity';
import {
  Column,
  JoinColumn,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { OrderStatus } from 'src/common/enums/order.enum';
import { OrderDetails } from './order-details.entity';
import { OrderItem } from './order-item.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  custom_id: string;

  @ManyToOne(() => User, (user) => user.order_ids)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.NEW,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: string;

  @OneToOne(() => OrderDetails, (details) => details.order_id)
  details: OrderDetails;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order_id)
  products: Product;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
