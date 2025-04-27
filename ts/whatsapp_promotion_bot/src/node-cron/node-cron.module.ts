import { Module } from '@nestjs/common';
import { SendMessageModule } from 'src/groups-processor/send-message/send-message.module';
import { NodeCronService } from './node-cron.service';

@Module({
  imports: [SendMessageModule],
  providers: [NodeCronService],
  exports: [NodeCronService],
})
export class NodeCronModule {}
