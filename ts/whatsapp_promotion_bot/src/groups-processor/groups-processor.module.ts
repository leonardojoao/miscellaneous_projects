import { Module } from '@nestjs/common';
import { RegisterModule } from './register/register.module';
import { SendMessageModule } from './send-message/send-message.module';

@Module({
  imports: [RegisterModule, SendMessageModule],
})
export class GroupsProcessorModule {}
