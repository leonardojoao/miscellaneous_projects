// src/processor/processor.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

import { ProcessOptions, ValidationResult } from './interfaces/process-options.interface';

import { VideoProcessingService } from '../video-processing/video-processing.service';
import { ShopeeAffiliateService } from '../shopee/shopee.service';

@Injectable()
export class ProcessorService {
  private readonly basePath = path.join(__dirname, '..', '..', 'products');
  private readonly musicPath = path.join(__dirname, '..', '..', 'music');
  private readonly productLibraryPath = path.join(__dirname, '..', '..', 'product_library');
  private readonly pythonPath = path.join(__dirname, '..', '..', 'venv-1.2', 'bin', 'python');
  private readonly subtitleScript = path.join(process.cwd(), 'src', 'scripts', 'add_subtitles.py');
  private readonly soundTextScript = path.join(process.cwd(), 'src', 'scripts', 'generate_text_for_sound.py');
  private readonly soundAudioScript = path.join(process.cwd(), 'src', 'scripts', 'generate_sound_for_product.py');

  private lastMusicUsed: string | null = null;

  constructor(
    private readonly videoService: VideoProcessingService,
    private readonly shopeeService: ShopeeAffiliateService,
  ) { }

  // ===============================
  // Método principal refatorado
  // ===============================
  async processAllProducts({ resolution = '1080x1920', subtitle = false, onlyShortVideo = false, onlyLongVideo = false }: ProcessOptions = {}) {
    const dateDirs = this.getDateDirs();

    for (const dateDir of dateDirs) {
      const productDirs = this.getProductDirs(dateDir);

      for (const productDir of productDirs) {
        const dirPath = path.join(this.basePath, dateDir, productDir);
        console.log(`📂 Date: ${dateDir} | 🎬 Product: ${productDir}`);

        let productName = await this.processShopeeIntegration(dirPath, productDir);
        if (!productName) productName = productDir;

        if (this.finalVideoAlreadyExists(dirPath)) continue;

        const audios = await this.ensureAudiosExist(dirPath, productName, onlyShortVideo, onlyLongVideo);
        const videos = this.getVideos(dirPath);

        await this.processVideosAndAudios(videos, audios, dirPath, resolution, subtitle);
      }
    }
  }

  // ===============================
  // Funções auxiliares
  // ===============================
  private getDateDirs(): string[] {
    return fs.readdirSync(this.basePath)
      .filter(name => fs.statSync(path.join(this.basePath, name)).isDirectory())
      .sort();
  }

  private getProductDirs(dateDir: string): string[] {
    const datePath = path.join(this.basePath, dateDir);
    return fs.readdirSync(datePath)
      .filter(name => fs.statSync(path.join(datePath, name)).isDirectory())
      .sort();
  }

  private async processShopeeIntegration(dirPath: string, productDir: string): Promise<string | null> {
    const link = await this.getLinkFromDir(dirPath);
    if (!link) return null;

    const dataProduct = await this.shopeeService.getProductOfferByUrl(link);
    if (dataProduct?.nodes?.length) {
      const offerLink = dataProduct.nodes[0].offerLink;
      const offerFile = path.join(dirPath, 'offer_link.txt');
      if (offerLink) fs.writeFileSync(offerFile, offerLink, 'utf-8');

      console.log('✅ Detalhes do produto obtidos', dataProduct.nodes[0]);
      return dataProduct.nodes[0].productName || productDir;
    }
    return null;
  }

  private finalVideoAlreadyExists(dirPath: string): boolean {
    const existingFinals = [
      path.join(dirPath, "video-audio_curto-final.mp4"),
      path.join(dirPath, "video-audio_longo-final.mp4"),
    ];
    const exists = existingFinals.some(f => fs.existsSync(f));
    if (exists) console.log("✅ Já existe vídeo final, pulando processamento...");
    return exists;
  }

  private async ensureAudiosExist(dirPath: string, productName: string, onlyShort: boolean, onlyLong: boolean): Promise<string[]> {
    let audios = this.getAudios(dirPath);
    if (audios.length === 0) {
      console.log(`⚠️ Nenhum áudio encontrado em ${dirPath}, verificando roteiros...`);
      const roteiroCurto = path.join(dirPath, "roteiro_curto.txt");
      const roteiroLongo = path.join(dirPath, "roteiro_longo.txt");

      if (!fs.existsSync(roteiroCurto) && !fs.existsSync(roteiroLongo)) {
        await this.generateTextForAudiosToProduct(dirPath, productName, onlyShort, onlyLong);
      }

      await this.generateAudiosToProduct(dirPath);
      audios = this.getAudios(dirPath);
    }
    return audios;
  }

  private getVideos(dirPath: string): string[] {
    return fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.mp4'))
      .map(f => path.join(dirPath, f));
  }

  private getAudios(dirPath: string): string[] {
    return fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.mp3'))
      .map(f => path.join(dirPath, f));
  }

  private async processVideosAndAudios(videos: string[], audios: string[], dirPath: string, resolution: string, subtitle: boolean) {
    console.log(`Found ${videos.length} videos and ${audios.length} audios`);

    for (const audio of audios) {
      const audioDuration = await this.videoService.getAudioDuration(audio);
      const segmentDurations = this.generateSegmentDurations(audioDuration);

      console.log(`🎵 Audio: ${path.basename(audio)} (${audioDuration.toFixed(1)}s)`);
      console.log(`Segments: [${segmentDurations.join(', ')}]`);

      const segments = await this.videoService.createRandomSegmentsFromVideos(
        videos,
        resolution,
        segmentDurations.length,
        dirPath,
        segmentDurations,
      );

      const tempVideo = path.join(dirPath, `temp-video-${Date.now()}.mp4`);
      await this.videoService.concatenateSegments(segments, tempVideo);
      this.videoService.cleanupSegments(segments);

      const finalOutput = path.join(dirPath, `video-${path.parse(audio).name}-final.mp4`);
      await this.videoService.mergeAudioWithVideo(tempVideo, audio, finalOutput);

      const finalOutputWithMusic = await this.addBackgroundMusicToVideo(finalOutput);
      fs.unlinkSync(tempVideo);

      if (finalOutputWithMusic && fs.existsSync(finalOutput)) {
        fs.unlinkSync(finalOutput);
        console.log(`🗑️ Arquivo base removido: ${finalOutput}`);
      }

      if (path.parse(audio).name === 'audio_curto' && subtitle) {
        const subtitledOutput = path.join(dirPath, `video-${path.parse(audio).name}-legendado.mp4`);
        await this.runPythonScript(finalOutputWithMusic ?? finalOutput, subtitledOutput);
        console.log(`🎉 Video with subtitles created: ${subtitledOutput}`);
      }
    }
  }

  private generateSegmentDurations(totalDuration: number): number[] {
    const segments: number[] = [];
    let total = 0;
    while (total < totalDuration) {
      const d = Math.floor(Math.random() * (7 - 3 + 1)) + 3;
      segments.push(d);
      total += d;
    }

    // garante que nunca fique menor que o total esperado
    if (total < totalDuration) {
      segments.push(totalDuration - total);
    }

    return segments;
  }

  // ===============================
  // Funções de áudio/música
  // ===============================
  private async addBackgroundMusicToVideo(videoFile: string): Promise<string | void> {
    const musics = fs.readdirSync(this.musicPath)
      .filter(f => f.endsWith('.mp3'))
      .map(f => path.join(this.musicPath, f));

    if (musics.length === 0) {
      console.log("⚠️ Nenhuma música encontrada em music/, pulando...");
      return;
    }

    let selectedMusic: string;
    do {
      selectedMusic = musics[Math.floor(Math.random() * musics.length)];
    } while (musics.length > 1 && selectedMusic === this.lastMusicUsed);

    this.lastMusicUsed = selectedMusic;
    console.log(`🎶 Música escolhida: ${path.basename(selectedMusic)}`);

    const videoDuration = await this.videoService.getVideoDuration(videoFile);
    const musicDuration = await this.videoService.getAudioDuration(selectedMusic);

    const musicCopies: string[] = [];
    let total = 0;
    while (total < videoDuration) {
      musicCopies.push(selectedMusic);
      total += musicDuration;
    }

    const extendedMusic = path.join(path.dirname(videoFile), `music-extended-${Date.now()}.mp3`);
    await this.concatenateAudios(musicCopies, extendedMusic);

    const outputWithMusic = path.join(path.dirname(videoFile), `${path.parse(videoFile).name}-music.mp4`);
    await this.mergeAudioTracks(videoFile, extendedMusic, outputWithMusic);

    console.log(`✅ Vídeo com música de fundo criado: ${outputWithMusic}`);
    fs.unlinkSync(extendedMusic);

    return outputWithMusic;
  }

  async concatenateAudios(files: string[], output: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const listFile = path.join(path.dirname(output), `concat-${Date.now()}.txt`);
      fs.writeFileSync(listFile, files.map(f => `file '${f}'`).join('\n'));

      const ffmpeg = spawn('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', output]);

      ffmpeg.on('close', (code) => {
        fs.unlinkSync(listFile);
        code === 0 ? resolve() : reject(new Error(`❌ Erro ao concatenar áudios (code ${code})`));
      });
    });
  }

  async mergeAudioTracks(videoFile: string, musicFile: string, output: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-y', '-i', videoFile, '-i', musicFile,
        '-filter_complex', "[1:a]volume=0.1[a1];[0:a][a1]amix=inputs=2:duration=first:dropout_transition=2[aout]",
        '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-shortest', output,
      ]);

      ffmpeg.on('close', (code) => code === 0 ? resolve() : reject(new Error(`❌ Erro ao mesclar áudio com música (code ${code})`)));
    });
  }

  // ===============================
  // Funções existentes de integração
  // ===============================
  async getLinkFromDir(dirPath: string): Promise<string | null> {
    const linkFile = path.join(dirPath, 'link.txt');
    if (!fs.existsSync(linkFile)) { console.warn(`⚠️ Nenhum link.txt encontrado em ${dirPath}`); return null; }

    const content = fs.readFileSync(linkFile, 'utf-8').trim();
    if (!content) { console.warn(`⚠️ link.txt vazio em ${dirPath}`); return null; }

    return content;
  }

  private async generateTextForAudiosToProduct(dirPath: string, productName: string, onlyShortVideo: boolean, onlyLongVideo: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Executando script Python para gerar textos para os áudios em ${dirPath}`);
      const pythonProcess = spawn(this.pythonPath, [this.soundTextScript, dirPath, productName, onlyShortVideo ? 'true' : 'false', onlyLongVideo ? 'true' : 'false']);

      pythonProcess.stdout.on('data', data => console.log(`PYTHON: ${data}`));
      pythonProcess.stderr.on('data', data => console.error(`PYTHON ERR: ${data}`));

      pythonProcess.on('close', code => code === 0 ? resolve() : reject(new Error(`Python exited with code ${code}`)));
    });
  }

  private async generateAudiosToProduct(dirPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Executando script Python para os áudios em ${dirPath}`);
      const pythonProcess = spawn(this.pythonPath, [this.soundAudioScript, dirPath]);

      pythonProcess.stdout.on('data', data => console.log(`PYTHON: ${data}`));
      pythonProcess.stderr.on('data', data => console.error(`PYTHON ERR: ${data}`));

      pythonProcess.on('close', code => code === 0 ? resolve() : reject(new Error(`Python exited with code ${code}`)));
    });
  }

  private runPythonScript(input: string, output: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, [this.subtitleScript, input, output]);

      process.stdout.on('data', data => console.log(`PYTHON: ${data}`));
      process.stderr.on('data', data => console.error(`PYTHON ERR: ${data}`));

      process.on('close', code => code === 0 ? resolve() : reject(new Error(`Python exited with code ${code}`)));
    });
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

  getBasePath(): string {
    return this.basePath;
  }
}
