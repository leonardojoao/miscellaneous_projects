import { Module } from '@nestjs/common';
import { SendMessageModule } from 'src/groups-processor/send-message/send-message.module';
import { AddContactModule } from 'src/groups-processor/add-contact/add-contact.module';
import { NodeCronService } from './node-cron.service';

@Module({
  imports: [SendMessageModule, AddContactModule],
  providers: [NodeCronService],
  exports: [NodeCronService],
})
export class NodeCronModule {}
