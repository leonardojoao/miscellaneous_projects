import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { ShopeeModule } from 'src/shopee/shopee.module';
import { SendMessageService } from './send-message.service';
import { VenomModule } from 'src/venom/venom.module';

@Module({
  imports: [FirebaseModule, ShopeeModule, VenomModule],
  providers: [SendMessageService],
  exports: [SendMessageService],
})
export class SendMessageModule {}
