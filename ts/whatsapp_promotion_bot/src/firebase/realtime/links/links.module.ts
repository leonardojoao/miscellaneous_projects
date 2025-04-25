import { Module } from '@nestjs/common';
import { LinksService } from './links.service';
import { FirebaseModule } from '../../firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [LinksService],
  exports: [LinksService],
})
export class LinksModule {}
