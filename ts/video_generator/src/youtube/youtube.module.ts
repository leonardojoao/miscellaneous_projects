// src/youtube/youtube.module.ts
import { Module } from '@nestjs/common';
import { YoutubeUploadService } from './youtube-upload.service';

@Module({
  providers: [YoutubeUploadService],
  exports: [YoutubeUploadService], // permite injetar em outros lugares
})
export class YoutubeModule {}
