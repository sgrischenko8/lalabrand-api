import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Request } from 'express';
import { TakeAndSkipDto } from 'src/common/dto/TakeAndSkipDto.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderStatusDto } from './dto/order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthAdminGuard } from 'src/auth/auth-admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Замовлення')
@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно отримано',
  })
  @ApiOperation({ summary: 'Отримати частину замовлень' })
  getOrders(@Query() { take, skip }: TakeAndSkipDto) {
    return this.orderService.getOrders(take, skip);
  }

  @Get(':id')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно отримано',
  })
  @ApiOperation({ summary: 'Вибрати замовлення за id' })
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOrder(id);
  }

  @Post('create')
  @ApiResponse({
    status: 201,
    description: 'SUCCESS - Сутність успішно отримано',
  })
  @ApiResponse({
    status: 400,
    description: 'NOT_CREATED - Сутність не cтворено',
  })
  @ApiResponse({
    status: 400,
    description: 'СART_IS_NOT_CREATED - Корзина ще не створена',
  })
  @ApiResponse({
    status: 400,
    description: 'CART_IS_EMPTY - Корзина не має товарів',
  })
  @ApiOperation({ summary: 'Запит на створення замовлення' })
  createOrder(@Body() dto: CreateOrderDto, @Req() req: Request) {
    return this.orderService.createOrder(dto, req.sessionID, req.lang);
  }

  @Patch('status/:id')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно отримано',
  })
  @ApiResponse({
    status: 400,
    description: 'NOT_UPDATED - Сутність не оновлено',
  })
  @ApiResponse({
    status: 400,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Зміна статусу замовлення' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: OrderStatusDto) {
    return this.orderService.updateStatus(id, dto.status);
  }

  @Get('list/user/:id')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Список сутностей успішно отримано',
  })
  @ApiOperation({ summary: 'Отримати cписок всіх замовлень юзера' })
  getUserOrders(@Param('id', ParseIntPipe) id: number, @Query() { take, skip }: TakeAndSkipDto) {
    return this.orderService.getUserOrders(id, take, skip);
  }
}
