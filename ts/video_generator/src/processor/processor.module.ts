// src/processor/processor.module.ts
import { Module } from '@nestjs/common';
import { ProcessorService } from './processor.service';
import { ShopeeModule } from '../shopee/shopee.module';
import { VideoProcessingModule } from '../video-processing/video-processing.module';


@Module({
  imports: [ShopeeModule, VideoProcessingModule],
  providers: [ProcessorService],
  exports: [ProcessorService],
})
export class ProcessorModule {}
