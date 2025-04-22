import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LinksService } from './links/links.service';
import { ContactsService } from './contacts/contacts.service';

@Module({
  imports: [ConfigModule],
  providers: [LinksService, ContactsService],
  exports: [LinksService],
})
export class FirebaseModule {}
