import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { FirebaseModule } from '../../firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class LinksModule {}
