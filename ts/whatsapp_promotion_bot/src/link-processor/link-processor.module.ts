import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LinkProcessorService } from './link-processor.service';
import { ShopeeModule } from 'src/shopee/shopee.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [ConfigModule, ShopeeModule, FirebaseModule],
  providers: [LinkProcessorService],
  exports: [LinkProcessorService],
})
export class LinkProcessorModule {}
