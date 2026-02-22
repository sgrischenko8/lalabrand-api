import {
  Controller,
  Body,
  Post,
  Patch,
  Delete,
  Req,
  Logger,
  Param,
  ParseIntPipe,
  Get,
  Put,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/cart-create.dto';
import { CartItemCreateDto } from './dto/cart-item-create.dto';
import { UpdateCartDto } from './dto/cart-update.dto';
import { CartItemAmountDto } from './dto/cart-item-amount.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CartItemCommentDto } from './dto/cart-item-comment';
import { CartDetailsUpdateDto } from './dto/cart-details-update.dto';

@ApiTags('Корзина')
@Controller('cart')
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Отримати корзину' })
  getCart(@Req() req: Request) {
    return this.cartService.getCart(req.sessionID, req.lang);
  }

  @Put('details/:id')
  @ApiOperation({ summary: 'Оновити деталі кошика' })
  getCartDetails(@Param('id', ParseIntPipe) id: number, @Body() dto: CartDetailsUpdateDto) {
    return this.cartService.updateCartDetails(id, dto);
  }

  @Post('create')
  @ApiOperation({ summary: 'Створити корзину' })
  create(@Body() dto: CreateCartDto, @Req() req: Request) {
    return this.cartService.createCart(dto, req.sessionID);
  }

  @Patch()
  @ApiOperation({ summary: 'Оновити корзину' })
  update(@Body() dto: UpdateCartDto, @Req() req: Request) {
    return this.cartService.updateCart(dto, req.sessionID, req.lang);
  }

  @Post('add-item')
  @ApiOperation({ summary: 'Додати набір товарів до корзини' })
  @ApiBody({
    type: CartItemCreateDto,
    description: 'Обʼєкт з масивом товарів',
    required: true,
    isArray: true,
  })
  addItem(@Body() dto: CartItemCreateDto[], @Req() req: Request) {
    return this.cartService.addItem(dto, req.sessionID);
  }

  @Patch('cart-item/amount')
  @ApiOperation({ summary: 'Оновити к-ть товару в корзині' })
  updateAmount(@Body() dto: CartItemAmountDto, @Req() req: Request) {
    return this.cartService.updateCartItemAmount(dto, req.sessionID);
  }

  @Patch('cart-item/comment')
  @ApiOperation({ summary: 'Оновити примітку товару в корзині' })
  updateComment(@Body() dto: CartItemCommentDto, @Req() req: Request) {
    return this.cartService.updateCartItemComment(dto, req.sessionID, req.lang);
  }

  @Delete('delete-item/:id')
  @ApiOperation({ summary: 'Видалити товар з корзини' })
  deleteItem(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.cartService.deleteItem(id, req.sessionID, req.lang);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Видалити корзину' })
  deleteCart(@Param('id', ParseIntPipe) id: number) {
    return this.cartService.delete(id);
  }
}
