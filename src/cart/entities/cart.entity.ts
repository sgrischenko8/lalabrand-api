import { User } from 'src/user/entities/user.entity';
import {
  Column,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CartItem } from './cart-item.entity';
import { CartDetails } from './cart-details.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  session_id: string;

  @OneToOne(() => User, (user) => user.cart_ids)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart_id)
  cart_items: CartItem[];

  @OneToOne(() => CartDetails, (details) => details.cart_id)
  details: CartDetails;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
