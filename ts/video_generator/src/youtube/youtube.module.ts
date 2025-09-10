// src/youtube/youtube.module.ts
import { Module } from '@nestjs/common';
import { YoutubeUploadService } from './youtube-upload.service';
import { YouTubeUtils } from './youtube-utils';
import { ProcessorModule } from '../processor/processor.module';
import { ShopeeModule } from '../shopee/shopee.module';

@Module({
  imports: [ProcessorModule, ShopeeModule], // módulos cujos serviços o YouTubeUtils depende
  providers: [YoutubeUploadService, YouTubeUtils],
  exports: [YouTubeUtils], // exporta para poder usar fora do módulo
})
export class YoutubeModule {}
