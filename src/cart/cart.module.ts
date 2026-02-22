import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartItem } from './entities/cart-item.entity';
import { Product } from 'src/product/entities/product.entity';
import { Order } from '../order/entities/order.entity';
import { IsExist } from 'src/common/validators/isExist.validator';
import { CartDetails } from './entities/cart-details.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartDetails, CartItem, Product, Order, User])],
  providers: [CartService, IsExist],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
