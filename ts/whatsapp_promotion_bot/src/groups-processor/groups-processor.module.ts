import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { GroupsProcessorController } from './groups-processor.controller';
import { GroupsProcessorService } from './groups-processor.service';

@Module({
  imports: [FirebaseModule],
  controllers: [GroupsProcessorController],
  providers: [GroupsProcessorService],
  exports: [GroupsProcessorService],
})
export class GroupsProcessorModule {}
