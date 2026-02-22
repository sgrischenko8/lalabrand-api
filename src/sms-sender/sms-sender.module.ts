import { Module } from '@nestjs/common';
import { SmsSenderService } from './sms-sender.service';
import { SmsSenderController } from './sms-sender.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [SmsSenderController],
  providers: [SmsSenderService],
})
export class SmsSenderModule {}
