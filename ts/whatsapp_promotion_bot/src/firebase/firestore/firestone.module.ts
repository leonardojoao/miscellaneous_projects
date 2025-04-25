import { Module } from '@nestjs/common';

import { LinksModule } from './links/links.module';

@Module({
  imports: [LinksModule],
  exports: [LinksModule],
})
export class FirestoneModule {}
