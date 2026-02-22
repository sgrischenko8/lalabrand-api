import {
  Controller,
  ParseIntPipe,
  Query,
  Param,
  Body,
  Get,
  Put,
  Post,
  Delete,
  Patch,
  Headers,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { TakeAndSkipDto } from 'src/common/dto/TakeAndSkipDto.dto';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { ProductParametersDto } from './dto/product-parameters.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductUpdateTranslateDto } from './dto/product-update-translate.dto';
import { ProductCreateTranslateDto } from './dto/product-create-translate.dto';
import { AuthAdminGuard } from 'src/auth/auth-admin.guard';
import { Product } from './entities/product.entity';
import { Request } from 'express';

@ApiTags('Товари')
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('search')
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано cутність',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Пошук товарів' })
  search(@Query('query') query: string, @Req() req: Request) {
    return this.productService.searchByTitle(query, req.lang);
  }

  @Get('viewed/list')
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано cутність',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Переглянуті товари' })
  async getViewedProducts(@Req() req: Request): Promise<Product[]> {
    const ids = Array.isArray(req.session?.products) ? req.session.products : [];

    if (!ids.length) return [];

    const viewedProducts = await this.productService.findMany(ids.map(Number), req.lang);

    return viewedProducts;
  }

  @Get('discount')
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано cутність',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({
    summary: 'Отримати товари зі знижками для головної сторінки',
  })
  findPromotedOnMainPage(@Req() req: Request) {
    return this.productService.findPromotedOnMainPage(req.lang);
  }

  @Get(':id/similar')
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано cутність',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({
    summary: 'Отримати cхожі товари',
  })
  findSimilar(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.productService.findSimilar(id, req.lang);
  }

  @Get('filter')
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано фільтровані сутності',
  })
  @ApiOperation({ summary: 'Отримати список фільтрованих товарів' })
  filter(@Query() query: ProductFilterDto, @Req() req: Request) {
    const { categories, parameters, take, skip, sort_by } = query;

    return this.productService.filter(categories, parameters, take, skip, sort_by, req.lang);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано частину сутностей',
  })
  @ApiOperation({ summary: 'Отримати частину товарів' })
  find(@Query() { take, skip }: TakeAndSkipDto, @Req() req: Request) {
    return this.productService.find(take, skip, req.lang);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано cутність',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Отримати товар' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.productService.findOne(id, req.lang, req);
  }

  @Get('url/:url')
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано cутність',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Отримати товар по url' })
  findOneByUrl(@Param('url') url: string, @Req() req: Request) {
    return this.productService.findOneByUrl(url, req.lang);
  }

  @Get('/packages')
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано сутності',
  })
  @ApiOperation({
    summary: 'Отримати товар що відносяться до категорії "Пакування"',
  })
  findPackages(@Req() req: Request) {
    return this.productService.findPackages(req.lang);
  }

  @Post()
  @UseGuards(AuthAdminGuard)
  @ApiOperation({
    summary: 'Cтворити товар',
  })
  @ApiResponse({
    status: 201,
    description: 'CREATED - Сутність успішно створено',
  })
  @ApiResponse({
    status: 400,
    description: 'NOT_CREATED - Cутність не створено',
  })
  create(@Body() dto: ProductCreateDto) {
    return this.productService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthAdminGuard)
  @ApiOperation({
    summary: 'Оновити товар',
  })
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно оновлено',
  })
  @ApiResponse({
    status: 400,
    description: 'NOT_UPDATED - Cутність не оновлено',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ProductUpdateDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно видалено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Cутність не знайдено',
  })
  @ApiOperation({
    summary: 'Видалити товар',
  })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productService.delete(id);
  }

  @Patch('parameters/:id')
  @UseGuards(AuthAdminGuard)
  @ApiOperation({
    summary: 'Оновити параметри товару',
  })
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно оновлено',
  })
  @ApiResponse({
    status: 400,
    description: 'NOT_UPDATED - Cутність не оновлено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Cутність не знайдено',
  })
  @ApiBody({
    description: 'Масив з id параметрів',
    type: ProductParametersDto,
    required: true,
  })
  updateParameters(@Param('id', ParseIntPipe) id: number, @Body() dto: ProductParametersDto) {
    return this.productService.updateParameters(id, dto);
  }

  @Post('/translates')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 201,
    description: 'SUCCESS - Сутності успішно створено',
  })
  @ApiOperation({ summary: 'Отримати всі переклади товарів' })
  @ApiBody({
    description: 'Масив перекладів',
    type: ProductCreateTranslateDto,
    isArray: true,
    required: true,
  })
  createTranslates(@Body() dto: ProductCreateTranslateDto[]) {
    return this.productService.createTranslates(dto);
  }

  @Put(':id/translates')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутності успішно оновлено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Cутність не знайдено',
  })
  @ApiBody({
    description: 'Масив перекладів',
    type: ProductUpdateTranslateDto,
    isArray: true,
    required: true,
  })
  @ApiOperation({ summary: 'Оновити переклади товару' })
  updateTranslates(@Body() dto: ProductUpdateTranslateDto[]) {
    return this.productService.updateTranslates(dto);
  }

  @Delete(':id/translate')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно видалено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Cутність не знайдено',
  })
  @ApiOperation({ summary: 'Оновити переклади товару' })
  deleteTranslate(@Param('id', ParseIntPipe) id: number) {
    return this.productService.deleteTranslate(id);
  }
}
