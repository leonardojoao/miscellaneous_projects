import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { LinkProcessorModule } from 'src/link-processor/link-processor.module';

@Module({
  imports: [
    ConfigModule,
    LinkProcessorModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
      }),
    }),
  ],
  providers: [TelegramService],
})
export class TelegramModule {}
