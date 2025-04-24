import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { ContactsProcessorController } from './contacts-processor.controller';
import { ContactsProcessorService } from './contacts-processor.service';

@Module({
  imports: [FirebaseModule],
  controllers: [ContactsProcessorController],
  providers: [ContactsProcessorService],
  exports: [ContactsProcessorService],
})
export class ContactsProcessorModule {}
