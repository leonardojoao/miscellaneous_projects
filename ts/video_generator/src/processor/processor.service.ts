// src/processor/processor.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { VideoProcessingService } from '../video-processing/video-processing.service';
import { ShopeeAffiliateService } from '../shopee/shopee.service';

import { ProcessOptions, ValidationResult } from './interfaces/process-options.interface';

@Injectable()
export class ProcessorService {
  private readonly basePath = path.join(__dirname, '..', '..', 'products');
  private readonly productLibraryPath = path.join(__dirname, '..', '..', 'product_library');
  private readonly pythonPath = path.join(__dirname, '..', '..', 'venv-1.2', 'bin', 'python');
  private readonly subtitleScript = path.join(process.cwd(), 'src', 'scripts', 'add_subtitles.py');
  private readonly soundTextScript = path.join(process.cwd(), 'src', 'scripts', 'generate_text_for_sound.py');
  private readonly soundAudioScript = path.join(process.cwd(), 'src', 'scripts', 'generate_sound_for_product.py');

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
        let productName = ''

        // ------------------------------------------------------------------------------
        // Integração com Shopee para obter detalhes do produto
        // ------------------------------------------------------------------------------
        const link = await this.getLinkFromDir(dirPath);

        if (link) {
          const dataProduct = await this.shopeeService.getProductOfferByUrl(link);

          if (dataProduct?.nodes?.length) {
            const offerLink = dataProduct.nodes[0].offerLink;
            const offerFile = path.join(dirPath, 'offer_link.txt');

            productName = dataProduct.nodes[0].productName || productDir;

            if (offerLink) {
              fs.writeFileSync(offerFile, offerLink, 'utf-8');
            } else {
              console.warn(`⚠️ Nenhum offerLink encontrado para ${dirPath}`);
            }
          }

          console.log('✅ Detalhes do produto obtidos', dataProduct?.nodes?.[0]);
        }

        // ------------------------------------------------------------------------------
        // Processamento de vídeos e áudios
        // ------------------------------------------------------------------------------

        const videos = fs
          .readdirSync(dirPath)
          .filter((f) => f.endsWith('.mp4'))
          .map((f) => path.join(dirPath, f));

        // ------------------------------------------------------------------------------
        // Verifica se já existe vídeo final
        // ------------------------------------------------------------------------------
        
        const existingFinals = [
          path.join(dirPath, "video-audio_curto-final.mp4"),
          path.join(dirPath, "video-audio_longo-final.mp4"),
        ];

        // Verifica se algum já existe
        const alreadyExists = existingFinals.some((file) => fs.existsSync(file));

        if (alreadyExists) {
          console.log("✅ Já existe vídeo final, pulando processamento...");
          continue;
        }

        // ------------------------------------------------------------------------------

        const audios = fs
          .readdirSync(dirPath)
          .filter((f) => f.endsWith('.mp3'))
          .map((f) => path.join(dirPath, f));

        if (audios.length === 0) {
          console.log(`⚠️ Nenhum áudio encontrado em ${dirPath}, gerando...`);

          await this.generateTextForAudiosToProduct(dirPath, productName);

          await this.generateAudiosToProduct(dirPath);
          console.log('✅ Áudios gerados com sucesso');
          
          // após gerar os áudios, atualiza o array
          audios.push(
            ...fs
              .readdirSync(dirPath)
              .filter((f) => f.endsWith('.mp3'))
              .map((f) => path.join(dirPath, f))
          );
        }

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
            `video-${path.parse(audio).name}-final.mp4`,
          );

          await this.videoService.mergeAudioWithVideo(tempVideo, audio, finalOutput);
          fs.unlinkSync(tempVideo);

          console.log(`✅ Final video created: ${finalOutput}`);

          if (path.parse(audio).name === 'audio_curto' && subtitle) {
            // 🚀 Agora roda o Python para adicionar legendas
            const subtitledOutput = path.join(dirPath, `video-${path.parse(audio).name}-legendado.mp4`);
            await this.runPythonScript(finalOutput, subtitledOutput);

            console.log(`🎉 Video with subtitles created: ${subtitledOutput}`);
          }
        }
      }
    }
  }

  async validateAllLinks(): Promise<ValidationResult> {
    const result: ValidationResult = { valid: [], invalid: [] };

    const dateDirs = fs
      .readdirSync(this.productLibraryPath)
      .filter((name) => fs.statSync(path.join(this.productLibraryPath, name)).isDirectory());

    console.log(`📊 Iniciando validação de ${dateDirs.length} produtos...`);

    for (const dateDir of dateDirs) {
      const datePath = path.join(this.productLibraryPath, dateDir);

      const productDirs = fs
        .readdirSync(datePath)
        .filter((name) => fs.statSync(path.join(datePath, name)).isDirectory());

      for (const productDir of productDirs) {
        const dirPath = path.join(datePath, productDir);
        const link = await this.getLinkFromDir(dirPath);

        if (link) {
          const isValid = await this.shopeeService.validateProductLink(link);

          if (isValid) {
            result.valid.push(link);
          } else {
            result.invalid.push(link);
          }
        }
      }
    }

    console.log(`\n📊 Validação concluída:`);
    console.log(`✅ Válidos: ${result.valid.length}`);
    console.log(`❌ Inválidos: ${result.invalid.length}`);

    return result;
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

  private async generateTextForAudiosToProduct(dirPath: string, productName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Executando script Python para gerar textos para os áudios em ${dirPath}`);

      const pythonProcess = spawn(this.pythonPath, [this.soundTextScript, dirPath, productName]);

      pythonProcess.stdout.on('data', (data) => console.log(`PYTHON: ${data}`));
      pythonProcess.stderr.on('data', (data) => console.error(`PYTHON ERR: ${data}`));

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Textos gerados com sucesso em ${dirPath}`);
          resolve();
        } else {
          reject(new Error(`Python exited with code ${code}`));
        }
      });
    });
  }

  private async generateAudiosToProduct(dirPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Executando script Python para os áudios em ${dirPath}`);

      const pythonProcess = spawn(this.pythonPath, [this.soundAudioScript, dirPath]);

      pythonProcess.stdout.on('data', (data) => console.log(`PYTHON: ${data}`));
      pythonProcess.stderr.on('data', (data) => console.error(`PYTHON ERR: ${data}`));

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ 'Audios gerados com sucesso em ${dirPath}`);
          resolve();
        } else {
          reject(new Error(`Python exited with code ${code}`));
        }
      });
    });
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
          .filter(
            (f) =>
              f === "video-audio_longo-final.mp4" ||
              f === "video-audio_curto-legendado.mp4"
          )
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
