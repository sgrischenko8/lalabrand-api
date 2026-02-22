import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';

import configuration from '../config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { FaqModule } from './faq/faq.module';
import { MailLayoutModule } from './mail-layout/mail-layout.module';
import { MailSenderModule } from './mail-sender/mail-sernder.module';
import { OrderModule } from './order/order.module';
import { ParameterModule } from './parameter/parameter.module';
import { ParameterCategoryModule } from './parameter-category/parameter-category.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { UserAddress } from './user-address/entities/user-address.entity';
import { CountryModule } from './country/country.module';
import { BrandModule } from './brand/brand.module';
import { RatingModule } from './product-rating/rating.module';
import { StockModule } from './product-stock/stock.module';
import { ProductPromotionModule } from './product-promotion/product-promotion.module';
import { CategoryPromotionModule } from './category-promotion/category-promotion.module';
import { MeasurementModule } from './measurement/measurement.module';
import { UserAddressModule } from './user-address/user-address.module';
import { AboutUsModule } from './about-us/about-us.module';
import { DAPModule } from './delivery-and-payment/dap.module';
import { ContactsModule } from './сontacts/contacts.module';
import { SmsSenderModule } from './sms-sender/sms-sender.module';

const config = configuration();

@Module({
  imports: [
    ConfigModule.forRoot(<ConfigModuleOptions>{
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(config.db),
    AuthModule,
    CartModule,
    CategoryModule,
    FaqModule,
    MailLayoutModule,
    MailSenderModule,
    OrderModule,
    ParameterModule,
    ParameterCategoryModule,
    ProductModule,
    UserModule,
    UserModule,
    UserAddress,
    CountryModule,
    BrandModule,
    MeasurementModule,
    RatingModule,
    StockModule,
    ProductPromotionModule,
    CategoryPromotionModule,
    UserAddressModule,
    AboutUsModule,
    DAPModule,
    ContactsModule,
    SmsSenderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
