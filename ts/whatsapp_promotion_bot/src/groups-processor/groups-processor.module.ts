import { Module } from '@nestjs/common';
import { RegisterModule } from './register/register.module';
import { SendMessageModule } from './send-message/send-message.module';
import { AddContactModule } from './add-contact/add-contact.module';

@Module({
  imports: [RegisterModule, SendMessageModule, AddContactModule],
})
export class GroupsProcessorModule {}
