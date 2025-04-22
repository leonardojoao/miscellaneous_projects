import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from './telegram/telegram.module';
// import { VenomModule } from './venom/venom.module';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { ShopeeModule } from './shopee/shopee.module';
// import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true }),
    // VenomModule,
    ConfigModule.forRoot({ isGlobal: true }),
    // VenomModule,
    // ShopeeModule,
    // FirebaseModule,
    TelegramModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
