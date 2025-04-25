import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { FirebaseModule } from '../../firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
