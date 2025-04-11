import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VenomModule } from './venom/venom.module';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true }),
    // VenomModule,
    ConfigModule.forRoot({ isGlobal: true }),
    VenomModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
