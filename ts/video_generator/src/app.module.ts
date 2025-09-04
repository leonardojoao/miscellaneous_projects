import { Module } from '@nestjs/common';
import { ProcessorModule } from './processor/processor.module';
import { DirectoryModule } from './directory/directory.module';
import { AuthModule } from './auth/auth.module';
import { YoutubeModule } from './youtube/youtube.module';
import { ShopeeModule } from './shopee/shopee.module';

@Module({
  imports: [AuthModule, DirectoryModule, ProcessorModule, YoutubeModule, ShopeeModule],
})
export class AppModule { }
