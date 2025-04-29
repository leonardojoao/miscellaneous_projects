import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AddContactService } from './add-contact.service';
import { VenomModule } from 'src/venom/venom.module';

@Module({
  imports: [FirebaseModule, VenomModule],
  providers: [AddContactService],
  exports: [AddContactService],
})
export class AddContactModule {}
