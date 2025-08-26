// src/processor/processor.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { VideoProcessingService } from '../video-processing/video-processing.service';

@Injectable()
export class ProcessorService implements OnModuleInit {
  private readonly basePath = path.join(__dirname, '..', '..', 'products');

  constructor(private readonly videoService: VideoProcessingService) {}

  async onModuleInit() {
    const resolution = '1080x1920';
    await this.processAllProducts(resolution);
  }

  private async processAllProducts(resolution: string) {
    const productDirs = fs
      .readdirSync(this.basePath)
      .filter((name) =>
        fs.statSync(path.join(this.basePath, name)).isDirectory(),
      )
      .sort(); // Ordem alfabética

    for (const dir of productDirs) {
      const dirPath = path.join(this.basePath, dir);

      const videos = fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith('.mp4'))
        .map((f) => path.join(dirPath, f));

      const audios = fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith('.mp3'))
        .map((f) => path.join(dirPath, f));

      console.log(`🎬 Processing product: ${dir}`);
      console.log(`Found ${videos.length} videos and ${audios.length} audios`);

      for (const audio of audios) {
        const audioDuration = await this.videoService.getAudioDuration(audio);
        const segmentsNeeded = Math.ceil(audioDuration / 3); // cortes de 3s

        console.log(`🎵 Audio: ${path.basename(audio)} (${audioDuration.toFixed(1)}s)`);
        console.log(`Segments needed: ${segmentsNeeded}`);

        const segments = await this.videoService.createRandomSegmentsFromVideos(
          videos,
          resolution,
          3,
          segmentsNeeded,
          dirPath,
        );

        const tempVideo = path.join(dirPath, `temp-video-${Date.now()}.mp4`);
        await this.videoService.concatenateSegments(segments, tempVideo);
        this.videoService.cleanupSegments(segments);

        const finalOutput = path.join(
          dirPath,
          `${path.parse(audio).name}-final.mp4`,
        );

        await this.videoService.mergeAudioWithVideo(tempVideo, audio, finalOutput);
        fs.unlinkSync(tempVideo);

        console.log(`✅ Final video created: ${finalOutput}`);

      }
    }
  }
}
