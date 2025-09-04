// src/processor/processor.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { VideoProcessingService } from '../video-processing/video-processing.service';
import { ShopeeAffiliateService } from '../shopee/shopee.service';

import { ProcessOptions } from './interfaces/process-options.interface';

@Injectable()
export class ProcessorService {
  private readonly basePath = path.join(__dirname, '..', '..', 'products');
  private readonly pythonPath = path.join(__dirname, '..', '..', 'venv', 'bin', 'python');
  private readonly subtitleScript = path.join(process.cwd(), 'src', 'scripts', 'add_subtitles.py');

  constructor(
    private readonly videoService: VideoProcessingService,
    private readonly shopeeService: ShopeeAffiliateService,
  ) { }


  async processAllProducts({ resolution = '1080x1920', subtitle = false }: ProcessOptions = {}) {
    const dateDirs = fs
      .readdirSync(this.basePath)
      .filter((name) =>
        fs.statSync(path.join(this.basePath, name)).isDirectory(),
      )
      .sort(); // Ordem alfabética

    for (const dateDir of dateDirs) {
      const datePath = path.join(this.basePath, dateDir);

      const productDirs = fs
        .readdirSync(datePath)
        .filter((name) =>
          fs.statSync(path.join(datePath, name)).isDirectory(),
        )
        .sort();

      for (const productDir of productDirs) {
        const dirPath = path.join(datePath, productDir);

        // ------------------------------------------------------------------------------
        // Integração com Shopee para obter detalhes do produto
        // ------------------------------------------------------------------------------
        const link = await this.getLinkFromDir(dirPath);

        if (link) {
          const dataProduct = await this.shopeeService.getProductOfferByUrl(link);

          if (dataProduct?.nodes?.length) {
            const offerLink = dataProduct.nodes[0].offerLink;
            const offerFile = path.join(dirPath, 'offer_link.txt');

            if (offerLink) {
              fs.writeFileSync(offerFile, offerLink, 'utf-8');
            } else {
              console.warn(`⚠️ Nenhum offerLink encontrado para ${dirPath}`);
            }
          }

          console.log('✅ Detalhes do produto obtidos');
        }

        // ------------------------------------------------------------------------------
        // Processamento de vídeos e áudios
        // ------------------------------------------------------------------------------

        const videos = fs
          .readdirSync(dirPath)
          .filter((f) => f.endsWith('.mp4'))
          .map((f) => path.join(dirPath, f));

        const audios = fs
          .readdirSync(dirPath)
          .filter((f) => f.endsWith('.mp3'))
          .map((f) => path.join(dirPath, f));

        console.log('🎬 Processing product...');
        console.log(`📂 Date: ${dateDir} | 🎬 Product: ${productDir}`);
        console.log(`Found ${videos.length} videos and ${audios.length} audios`);

        for (const audio of audios) {
          const audioDuration = await this.videoService.getAudioDuration(audio);
          const segmentsNeeded = Math.ceil(audioDuration / 3);

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

          if (path.parse(audio).name === 'curto' && subtitle) {
            // 🚀 Agora roda o Python para adicionar legendas
            const subtitledOutput = path.join(dirPath, `${path.parse(audio).name}-legendado.mp4`);
            await this.runPythonScript(finalOutput, subtitledOutput);

            console.log(`🎉 Video with subtitles created: ${subtitledOutput}`);
          }
        }
      }
    }
  }

  async getLinkFromDir(dirPath: string): Promise<string | null> {
    const linkFile = path.join(dirPath, 'link.txt');

    if (!fs.existsSync(linkFile)) {
      console.warn(`⚠️ Nenhum link.txt encontrado em ${dirPath}`);
      return null;
    }

    const content = fs.readFileSync(linkFile, 'utf-8').trim();

    if (!content) {
      console.warn(`⚠️ link.txt vazio em ${dirPath}`);
      return null;
    }

    return content;
  }

  async getAllFinalVideos(): Promise<string[]> {
    const finalVideos: string[] = [];

    const dateDirs = fs
      .readdirSync(this.basePath)
      .filter((name) => fs.statSync(path.join(this.basePath, name)).isDirectory());

    for (const dateDir of dateDirs) {
      const datePath = path.join(this.basePath, dateDir);

      const productDirs = fs
        .readdirSync(datePath)
        .filter((name) => fs.statSync(path.join(datePath, name)).isDirectory());

      for (const productDir of productDirs) {
        const dirPath = path.join(datePath, productDir);

        const videos = fs
          .readdirSync(dirPath)
          .filter((f) => f.endsWith('-final.mp4'))
          .map((f) => path.join(dirPath, f));

        finalVideos.push(...videos);
      }
    }

    return finalVideos;
  }

  private runPythonScript(input: string, output: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, [this.subtitleScript, input, output]);

      process.stdout.on('data', (data) => console.log(`PYTHON: ${data}`));
      process.stderr.on('data', (data) => console.error(`PYTHON ERR: ${data}`));

      process.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Python exited with code ${code}`));
      });
    });
  }
}
