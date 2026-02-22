import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity';
import { CreateCartDto } from './dto/cart-create.dto';

import { CartItem } from './entities/cart-item.entity';
import { CartItemCreateDto } from './dto/cart-item-create.dto';
import { UpdateCartDto } from './dto/cart-update.dto';
import { CartItemAmountDto } from './dto/cart-item-amount.dto';
import { CartData } from './types/cart.types';
import { applyTranslations } from 'src/common/utils/apply-translates.util';
import { LANG } from 'src/common/enums/translation.enum';
import { CartItemCommentDto } from './dto/cart-item-comment';
import { CartDetails } from './entities/cart-details.entity';
import { CartDetailsUpdateDto } from './dto/cart-details-update.dto';
import { getTotalAndAmount } from './utils/cart.utils';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(CartDetails)
    private cartDetailsRepo: Repository<CartDetails>,
  ) {}

  async getCart(session_id: string, lang: LANG): Promise<CartData> {
    const cart: Cart | null = await this.cartRepo.findOne({
      where: { session_id },
      relations: [
        'user_id',
        'details',
        'cart_items',
        'cart_items.product_id',
        'cart_items.product_id.brand_id',
        'cart_items.product_id.category_id',
        'cart_items.product_id.category_id.translates',
        'cart_items.product_id.measurement_id',
        'cart_items.product_id.measurement_id.translates',
        'cart_items.product_id.parameters',
        'cart_items.product_id.parameters.translates',
        'cart_items.product_id.promotion_id',
        'cart_items.product_id.promotion_id.translates',
      ],
    });

    if (cart === null) {
      return { cart: null, amount: 0, total: '0.00' };
    }

    if (cart.cart_items?.length) {
      const products = cart.cart_items.map((item) => item.product_id);
      let translatedProducts = applyTranslations(products, lang);

      translatedProducts = translatedProducts.map((product) => {
        if (product.category_id && product.category_id.translates) {
          product.category_id = applyTranslations([product.category_id], lang)[0];
        }
        if (product.measurement_id && product.measurement_id.translates) {
          product.measurement_id = applyTranslations([product.measurement_id], lang)[0];
        }
        if (product.promotion_id && product.promotion_id.translates) {
          product.promotion_id = applyTranslations([product.promotion_id], lang)[0];
        }
        if (product.parameters && Array.isArray(product.parameters)) {
          product.parameters = applyTranslations(product.parameters, lang);
        }
        return product;
      });

      cart.cart_items.forEach((item, idx) => {
        item.product_id = translatedProducts[idx];
      });
    }

    const { total, amount } = getTotalAndAmount(cart);

    return { amount, total, cart };
  }

  async createCart(dto: CreateCartDto, session_id: string): Promise<Cart> {
    const { user_id } = dto;

    const newCart = this.cartRepo.create({ session_id, user_id });

    let cart: Cart | null = null;

    try {
      cart = await this.cartRepo.save(newCart);
    } catch (err) {
      this.logger.error(`Error while creating cart: ${err}`);
      throw new BadRequestException('NOT_CREATED');
    }

    if (cart?.id) {
      const { coords, delivery_type, meta_data } = dto;

      const cartDetails = this.cartDetailsRepo.create({
        cart_id: { id: cart.id },
        coords,
        delivery_type,
        meta_data,
      });

      try {
        await this.cartDetailsRepo.save(cartDetails);
      } catch (err) {
        this.logger.error(`Error to create cart details for cart with id ${cart?.id} \n ${err}`);
      }
    }

    return cart;
  }

  async updateCart(dto: UpdateCartDto, session_id: string, lang: LANG): Promise<CartData> {
    const { user_id, ...cartDetails } = dto;

    if (user_id && typeof user_id === 'number') {
      const userExist = await this.userRepo.findOne({ where: { id: user_id } });

      if (!userExist) throw new NotFoundException('User NOT_FOUND with provided id');
    }

    const shoppingCart = await this.cartRepo.findOne({
      where: { session_id },
      relations: ['details'],
    });

    if (shoppingCart) {
      await this.cartRepo.update({ session_id }, { user_id });

      const details_id = shoppingCart?.details?.id;

      if (details_id) {
        await this.cartDetailsRepo.update({ id: details_id }, cartDetails);
      }

      return await this.getCart(session_id, lang);
    } else {
      this.logger.warn(
        `Cart not found cart with session_id ${session_id} when trying to update cart`,
      );
      throw new BadRequestException('NOT_FOUND');
    }
  }

  async updateCartDetails(id: number, dto: CartDetailsUpdateDto): Promise<CartDetails | null> {
    const { cart_id, ...cartDetails } = dto;

    const entity = await this.cartDetailsRepo.findOne({ where: { id } });

    if (!entity) throw new NotFoundException();

    await this.cartDetailsRepo.update({ id }, { cart_id: { id: cart_id }, ...cartDetails });

    return await this.cartDetailsRepo.findOne({ where: { id } });
  }

  async createCartItems(dto: CartItemCreateDto, cartId: number) {
    const { product_id, amount, bundle_id, parent_bundle_id, custom_id, comment } = dto;

    if (parent_bundle_id && +bundle_id) {
      this.logger.error("This product can't be a bundle and belong to bundle at same time");
      throw new BadRequestException('BUNDLE_CANT_BE_BELONG_TO_BUNDLE');
    }
    if (product_id === +bundle_id) {
      this.logger.error("This product can't be a bundle of itself");
      throw new BadRequestException('CANT_BE_BUNDLE_OF_ITSELF');
    }

    try {
      const data = {
        custom_id,
        product_id: { id: product_id },
        amount: amount,
        parent_bundle_id,
        bundle_id,
        comment,
        cart_id: { id: cartId },
      };

      const newCartItem = this.cartItemRepo.create(data);

      return await this.cartItemRepo.save(newCartItem);
    } catch (err) {
      this.logger.error(`Error to create cart item \n ${err}`);
      throw new BadRequestException('cart item is NOT_CREATED');
    }
  }

  async addItem(dto: CartItemCreateDto[], session_id: string): Promise<CartData> {
    const shoppingCart = await this.cartRepo.findOne({ where: { session_id } });

    let cart: Cart | null = null;

    if (!shoppingCart) {
      throw new NotFoundException('NOT_FOUND');
    } else {
      cart = await this.cartRepo.findOne({ where: { session_id } });
    }

    if (cart) {
      for (const product of dto) {
        await this.createCartItems(product, cart.id);
      }

      return await this.getCart(session_id, LANG.UA);
    } else {
      this.logger.warn(`Cart has not been found for session_id ${session_id}`);
      throw new NotFoundException(`cart is NOT_FOUND for session_id ${session_id}`);
    }
  }

  async updateCartItemAmount(dto: CartItemAmountDto, session_id: string): Promise<CartData> {
    const { id, amount } = dto;

    try {
      await this.cartItemRepo.update(id, { amount });
    } catch (err) {
      this.logger.error(
        `Error to update cartItem with id ${id} in cart with session_id ${session_id} \n ${err}`,
      );
      throw new BadRequestException('cart item is NOT_UPDATED');
    }

    return await this.getCart(session_id, LANG.UA);
  }

  async updateCartItemComment(
    dto: CartItemCommentDto,
    session_id: string,
    lang: LANG,
  ): Promise<CartData> {
    const { comment, id } = dto;

    try {
      const result = await this.cartItemRepo.update(id, { comment });

      if (result.affected === 0) throw new NotFoundException('cart item is NOT_FOUND');
    } catch (err) {
      this.logger.error(
        `Error to update cartItem comment with id ${id} in cart with session_id ${session_id} \n ${err}`,
      );
      throw new BadRequestException('cart item is NOT_UPDATED');
    }

    return await this.getCart(session_id, lang);
  }

  async deleteItem(
    id: number,
    session_id: string,
    lang: LANG,
  ): Promise<CartData | BadRequestException> {
    const shoppingCart = await this.cartRepo.findOne({ where: { session_id } });

    if (shoppingCart) {
      const cartItem = await this.cartItemRepo.findOne({
        where: { id },
        relations: ['product_id'],
      });

      if (!cartItem) {
        throw new NotFoundException('Cart item NOT_FOUND');
      }

      await this.cartItemRepo.delete(id);
      return await this.getCart(session_id, lang);
    } else {
      this.logger.warn(
        `Cart not found for session_id ${session_id} when trying to delete item with id ${id}`,
      );
      throw new BadRequestException('session_id is NOT_FOUND while deleting cart item');
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    const image = await this.cartRepo.findOne({ where: { id } });

    if (!image) throw new NotFoundException('cart item is NOT_FOUND');

    try {
      await this.cartRepo.delete(id);
    } catch (err) {
      this.logger.error(`Error deleting cart with id ${id}: ${err}`);
      throw new BadRequestException('cart item is NOT_DELETED');
    }

    return { message: 'SUCCESS' };
  }
}
