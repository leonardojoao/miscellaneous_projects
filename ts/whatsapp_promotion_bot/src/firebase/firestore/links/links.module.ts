import { Module } from '@nestjs/common';
import { FirestoneCoreModule } from '../firestone-core.module';
import { LinksService } from './links.service';

@Module({
  imports: [FirestoneCoreModule],
  providers: [LinksService],
  exports: [LinksService],
})
export class LinksModule {}
