import { Module } from '@nestjs/common';
import { ProcessorModule } from './processor/processor.module';
import { DirectoryModule } from './directory/directory.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, DirectoryModule, ProcessorModule],
})
export class AppModule {}
