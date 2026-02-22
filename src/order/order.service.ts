import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CartService } from 'src/cart/cart.service';
import { LANG } from 'src/common/enums/translation.enum';
import { OrderStatus } from 'src/common/enums/order.enum';
import { User } from 'src/user/entities/user.entity';
import { OrderDetails } from './entities/order-details.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderDetails)
    private orderDetailsRepo: Repository<OrderDetails>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    private cartService: CartService,
  ) {}

  async getOrder(id: number): Promise<Order | null> {
    const entity = await this.orderRepo.findOne({
      where: { id },
      relations: ['user_id', 'details', 'products'],
    });

    return entity;
  }

  async getOrders(take: number, skip: number): Promise<{ entities: Order[]; count: number }> {
    const [orders, count] = await this.orderRepo.findAndCount({
      take,
      skip,
      relations: ['user_id', 'details', 'products'],
    });
    return { entities: orders, count };
  }

  async getUserOrders(
    id: number,
    take: number,
    skip: number,
  ): Promise<{ entities: Order[]; count: number }> {
    const userExist = await this.userRepo.findOne({ where: { id } });

    if (!userExist) throw new NotFoundException('User with this id is NOT_FOUND');

    const [orders, count] = await this.orderRepo.findAndCount({
      where: { user_id: { id } },
      take,
      skip,
      relations: ['user_id', 'details', 'products'],
    });

    return { entities: orders, count };
  }

  async createOrder(dto: CreateOrderDto, session_id: string, lang: LANG) {
    const shoppingCart = await this.cartService.getCart(session_id, lang);

    if (!shoppingCart?.cart) {
      throw new BadRequestException('СART_IS_NOT_CREATED');
    }

    const user_id = shoppingCart.cart.user_id;
    const total = shoppingCart.total;
    const products = shoppingCart.cart.cart_items;

    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new BadRequestException('CART_IS_EMPTY');
    }

    let order: Order | null = null;

    const newOrder = this.orderRepo.create({
      custom_id: '',
      status: OrderStatus.NEW,
      user_id,
      total,
    });

    let orderData: Order | null;

    try {
      orderData = await this.orderRepo.save(newOrder);
    } catch (err) {
      this.logger.error(`Error create order: ${err.message || err}`);
      throw new BadRequestException('Order is NOT_CREATED');
    }

    const order_id: number = orderData.id;

    const details = this.orderDetailsRepo.create({
      order_id: { id: order_id },
      payment_link: '',
      payment_id: '',
      is_paid: false,
      payment_link_created_at: null,
      receipt_url: '',
      ...dto,
    });

    try {
      await this.orderDetailsRepo.save(details);
    } catch (err) {
      this.logger.error(`Error to save order details for order with id ${order_id} \n ${err}`);
    }

    for (const product of products) {
      const { custom_id, amount } = product;
      const { price, measurement_id, id } = product.product_id;

      const orderItem = this.orderItemRepo.create({
        custom_id,
        amount,
        measurement: JSON.stringify(measurement_id),
        product_id: { id },
        order_id: { id: order_id },
        price,
      });

      try {
        await this.orderItemRepo.save(orderItem);
      } catch (err) {
        this.logger.error(`Order item is not created for order with id ${order_id} \n ${err}`);
      }
    }

    order = await this.getOrder(order_id);

    if (order && shoppingCart?.cart?.id) {
      await this.cartService.delete(shoppingCart.cart.id);
    }

    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    try {
      await this.orderRepo.update(id, { status });
    } catch (err) {
      throw new BadRequestException(`Status of order with id ${id} is NOT_UPDATED \n ${err}`);
    }

    const updatedOrder = await this.orderRepo.findOne({ where: { id } });
    if (!updatedOrder) throw new NotFoundException(`Order with id ${id} is NOT_FOUND`);

    return updatedOrder;
  }
}
