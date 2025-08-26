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
    const totalDuration = 77; // em segundos
    await this.processAllProducts(resolution, totalDuration);
  }

  private async processAllProducts(resolution: string, totalDuration: number) {
    const productDirs = fs
      .readdirSync(this.basePath)
      .filter((name) =>
        fs.statSync(path.join(this.basePath, name)).isDirectory(),
      )
      .sort(); // Ordem alfabética

    const allSegments: string[] = [];

    for (const dir of productDirs) {
      const dirPath = path.join(this.basePath, dir);
      const videos = fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith('.mp4'))
        .map((f) => path.join(dirPath, f));

      const productDuration = totalDuration / productDirs.length;
      const segmentsNeeded = Math.ceil(productDuration / 3); // 3s por corte

      console.log(`Processing product: ${dir} with ${videos.length} videos`);
      console.log(`Segments needed: ${segmentsNeeded}, Product duration: ${productDuration}s`);

      const segments = await this.videoService.createRandomSegmentsFromVideos(
        videos,
        resolution,
        3,
        segmentsNeeded,
        dirPath,
      );

      // allSegments.push(...segments);
      const outputPath = path.join(dirPath, 'output.mp4');
      await this.videoService.concatenateSegments(segments, outputPath);

      // Remove os arquivos temporários de cortes
      this.videoService.cleanupSegments(segments);

      console.log(`✅ Vídeo final salvo em: ${outputPath}`);
    }
  }
}
