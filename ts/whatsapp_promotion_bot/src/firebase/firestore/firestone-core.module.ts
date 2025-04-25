import { Module } from '@nestjs/common';
import { firestoneProvider } from './firestone.provider';

@Module({
  providers: [firestoneProvider],
  exports: [firestoneProvider],
})
export class FirestoneCoreModule {}
