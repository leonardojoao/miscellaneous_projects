// src/video-processing/video-processing.module.ts
import { Module } from '@nestjs/common';
import { VideoProcessingService } from './video-processing.service';

@Module({
  providers: [VideoProcessingService],
  exports: [VideoProcessingService],
})
export class VideoProcessingModule {}
