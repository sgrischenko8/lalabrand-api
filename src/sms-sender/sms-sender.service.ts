import { BadRequestException, Injectable } from '@nestjs/common';
import { SMSSender } from './dto/sms-sender.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class SmsSenderService {
  constructor(private readonly httpService: HttpService) {}

  async send(dto: SMSSender) {
    const { recipients, message_data } = dto;

    await firstValueFrom(
      this.httpService
        .post(
          'https://api.turbosms.ua/message/send.json',
          {
            recipients,
            sms: {
              ...message_data,
            },
          },
          {
            headers: {
              Authorization: 'Bearer 42f3dd3c9dcefe4b4e79b8554cabb07fe1dfa82d',
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error?.response?.data);
            throw new BadRequestException('error');
          }),
        ),
    );
  }
}
