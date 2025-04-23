import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { firebaseProviders } from './firebase.providers';
import { LinksService } from './links/links.service';
import { ContactsService } from './contacts/contacts.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { GroupsService } from './groups/groups.service';

@Module({
  imports: [ConfigModule],
  providers: [
    ...firebaseProviders,
    FirebaseAuthService,
    LinksService,
    ContactsService,
    GroupsService,
  ],
  exports: [
    ...firebaseProviders,
    FirebaseAuthService,
    LinksService,
    ContactsService,
    GroupsService,
  ],
})
export class FirebaseModule {}
