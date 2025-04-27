import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VenomModule } from './venom/venom.module';
import { TelegramModule } from './telegram/telegram.module';
import { GroupsProcessorModule } from './groups-processor/groups-processor.module';
import { ContactsProcessorModule } from './contacts-processor/contacts-processor.module';
import { NodeCronModule } from './node-cron/node-cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    VenomModule,
    TelegramModule,
    GroupsProcessorModule,
    ContactsProcessorModule,
    NodeCronModule,
  ],
})
export class AppModule {}
