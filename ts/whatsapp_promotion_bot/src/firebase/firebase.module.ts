import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { firebaseProviders } from './firebase.providers';
import { LinksService } from './realtime/links/links.service';
import { ContactsService } from './realtime/contacts/contacts.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { GroupsService } from './realtime/groups/groups.service';

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
