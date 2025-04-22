import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './links/links.service';
import { ContactsService } from './contacts/contacts.service';

@Module({
  imports: [ConfigModule],
  providers: [FirebaseService, ContactsService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
