import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { firebaseProviders } from './firebase.providers';
import { LinksService } from './links/links.service';
import { ContactsService } from './contacts/contacts.service';
import { FirebaseAuthService } from './firebase-auth.service';

@Module({
  imports: [ConfigModule],
  providers: [
    ...firebaseProviders,
    FirebaseAuthService,
    LinksService,
    ContactsService,
  ],
  exports: [...firebaseProviders, FirebaseAuthService, LinksService],
})
export class FirebaseModule {}
