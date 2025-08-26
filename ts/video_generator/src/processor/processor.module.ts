// src/processor/processor.module.ts
import { Module } from '@nestjs/common';
import { ProcessorService } from './processor.service';
import { VideoProcessingModule } from '../video-processing/video-processing.module';

@Module({
  imports: [VideoProcessingModule],
  providers: [ProcessorService],
})
export class ProcessorModule {}
