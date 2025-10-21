// src/youtube/youtube-utils.ts
import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

import { ProcessorService } from '../processor/processor.service';
import { YoutubeUploadService } from './youtube-upload.service';
import { ShopeeAffiliateService } from '../shopee/shopee.service';

interface VideoItem {
  video: string;
  link?: string;
}

@Injectable()
export class YouTubeUtils {
  private readonly pythonPath = path.join(__dirname, '..', '..', 'venv-1.2', 'bin', 'python');
  private readonly titleScript = path.join(process.cwd(), 'src', 'scripts', 'generate_title.py');
  private readonly descriptionScript = path.join(process.cwd(), 'src', 'scripts', 'generate_description.py');
  private readonly tagsScript = path.join(process.cwd(), 'src', 'scripts', 'generate_tags.py');
  private readonly slingshotDescriptionPath = path.join(process.cwd(), 'src', 'youtube', 'descriptions', 'slingshot-description.txt');

  constructor(
    private readonly processorService: ProcessorService,
    private readonly youtubeService: YoutubeUploadService,
    private readonly shopeeService: ShopeeAffiliateService,
  ) {}

  /**
   * Faz upload de todos os vídeos, agrupados por data.
   */
  async uploadAllVideos({ mode = 'random' }: { mode?: 'random' | 'sequential' } = {}) {
    const basePath = this.processorService.getBasePath();
    const dateDirs = this.getDirectories(basePath);

    for (const dateDir of dateDirs) {
      console.log(`📅 ${dateDir}`);
      const datePath = path.join(basePath, dateDir);
      const videosByDate = await this.collectVideosByDate(datePath, mode);

      for (const [dateKey, dailyVideos] of Object.entries(videosByDate)) {
        const scheduleTimes = this.generateDailySchedule(dailyVideos.length);
        console.log(`📅 ${dateKey} — ${dailyVideos.length} vídeos`);

        const uploadResults: { status: 'fulfilled' | 'rejected'; value?: any; reason?: any }[] = [];

        for (let i = 0; i < dailyVideos.length; i++) {
          const item = dailyVideos[i];
          const schedule = scheduleTimes[i];
          const videoName = path.basename(item.video);

          try {
            console.log(`🚀 [${i + 1}/${dailyVideos.length}] Iniciando upload: ${videoName}`);
            const result = await this.uploadSingleVideo(item, schedule, dateKey, i, mode);
            uploadResults.push({ status: 'fulfilled', value: result });
            console.log(`✅ Upload concluído: ${videoName}`);
          } catch (err) {
            console.error(`❌ Erro no upload de ${videoName}:`, err);
            uploadResults.push({ status: 'rejected', reason: err });
          }

          if (i < dailyVideos.length - 1) {
            const delayMs = 45_000;
            console.log(`⏳ Aguardando ${delayMs / 1000}s antes do próximo upload...`);
            await new Promise((res) => setTimeout(res, delayMs));
          }
        }

        // Logging resumido ao final do dia
        const summary = uploadResults.map((r, i) => ({
          vídeo: path.basename(dailyVideos[i].video),
          status: r.status === 'fulfilled' ? '✅ Sucesso' : '❌ Falha',
        }));
        console.table(summary);
      }
    }
  }


  /** Envia um único vídeo com título, descrição, tags e horário de publicação. */
  private async uploadSingleVideo(
    { video, link }: VideoItem,
    time: { h: number; m: number },
    dateKey: string,
    index: number,
    mode: 'random' | 'sequential',
  ) {
    let title = '';
    let description = '';
    let tags: string[] = [''];

    console.log('⚠️ Modo sequencial: título, descrição e tags padrão serão usados.', mode);

    try {
      if (mode === 'random' && link) {
        const data = await this.shopeeService.getProductOfferByUrl(link);
        const product = data.nodes[0];
        const { productName, offerLink } = product;

        [title, description, tags] = await Promise.all([
          this.generateTitle(productName),
          this.generateDescription(productName, offerLink),
          this.generateTags(productName),
        ]);
      } else {
        console.log('⚠️ Modo sequencial: título, descrição e tags padrão serão usados.');
        const [day, ,] = dateKey.split('-').reverse();
        title = `Slingshot Ride - The Most Extreme Oops Moment! 😂🎢 Part ${index+1} - Day ${day}`;
        description = fs.readFileSync(this.slingshotDescriptionPath, 'utf-8');
        tags = ['slingshot','slingshot ride','slingshot challenge','slingshot reaction','slingshot funny moments','slingshot fail','slingshot compilation','slingshot meme','slingshot pass out','amusement park','funny fails','funny reactions','viral video','trending shorts','funny memes','roller coaster reactions','rides fail','extreme ride','diversão','momentos engraçados','falhas engraçadas','melhores reações','brinquedo radical','parque de diversões','vídeo viral','shorts engraçados','desafio slingshot'];
      }

      console.log('title', title);

      const publishAtUTC = this.buildPublishDate(dateKey, time);
      await this.youtubeService.uploadVideo(video, title, description, tags, publishAtUTC);

      console.log(
        `✅ ${path.basename(video)} agendado para ${publishAtUTC.toISOString()} (${time.h}:${String(time.m).padStart(2, '0')})`,
      );
    } catch (err: any) {
      console.error(`❌ Erro ao enviar ${video}: ${err.message}`);
    }
  }

  /** Retorna apenas diretórios dentro de um caminho. */
  private getDirectories(source: string): string[] {
    return fs
      .readdirSync(source)
      .filter((name) => fs.statSync(path.join(source, name)).isDirectory());
  }

  /** Agrupa vídeos por data, considerando modo random ou sequential. */
  private async collectVideosByDate(datePath: string, mode: 'random' | 'sequential') {
    const productDirs = this.getDirectories(datePath);
    const videosByDate: Record<string, VideoItem[]> = {};

    for (const productDir of productDirs) {
      const dirPath = path.join(datePath, productDir);
      const videos = this.getExistingVideos(dirPath);

      console.log(`   📁 ${productDir} — ${videos.length} vídeos`);
      if (videos.length === 0) continue;

      let link: string | undefined;
      if (mode === 'random') {
        const linkFile = path.join(dirPath, 'link.txt');
        if (!fs.existsSync(linkFile)) continue;
        link = fs.readFileSync(linkFile, 'utf-8').trim();
      }

      const dateKey = this.extractDateKey(datePath);
      if (!dateKey) continue;

      videosByDate[dateKey] ||= [];
      videosByDate[dateKey].push(...videos.map((video) => ({ video, link })));
    }

    return videosByDate;
  }

  /** Retorna lista de vídeos existentes em um diretório. */
  private getExistingVideos(dirPath: string): string[] {
    const candidates = [
      'video-audio_longo-final-music.mp4',
      'video-audio_curto-legendado.mp4',
      'video-final-music.mp4',
    ];
    return candidates
      .map((f) => path.join(dirPath, f))
      .filter((filePath) => fs.existsSync(filePath));
  }

  /** Extrai a data no formato YYYY-MM-DD a partir do caminho. */
  private extractDateKey(dirPath: string): string | null {
    // const match = dirPath.match(/product-(\d{2})-(\d{2})-(\d{2})/);
    const match = dirPath.match(/(?:product|slingshot)-(\d{2})-(\d{2})-(\d{2})/i);
    if (!match) return null;
    const [, day, month, year] = match;
    return `20${year}-${month}-${day}`;
  }

  /** Gera horários espaçados uniformemente entre 7h e 20h. */
  private generateDailySchedule(totalVideos: number) {
    const startHour = 7;
    const endHour = 20;
    const totalMinutes = (endHour - startHour) * 60;
    const interval = totalVideos > 1 ? totalMinutes / (totalVideos - 1) : 0;

    return Array.from({ length: totalVideos }, (_, i) => {
      const minutesFromStart = Math.round(i * interval);
      const total = startHour * 60 + minutesFromStart;
      return { h: Math.floor(total / 60), m: total % 60 };
    });
  }

  /** Constrói uma data em UTC ajustada para o horário de Brasília. */
  private buildPublishDate(dateKey: string, { h, m }: { h: number; m: number }) {
    const localDate = new Date(`${dateKey}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00-03:00`);
    return new Date(localDate.toISOString());
  }

  // ======== PYTHON HELPERS ========

  private async generateTitle(productName: string): Promise<string> {
    return this.runPythonScript(this.titleScript, [productName]);
  }

  private async generateDescription(productName: string, link: string): Promise<string> {
    return this.runPythonScript(this.descriptionScript, [productName, link]);
  }

  private async generateTags(productName: string): Promise<string[]> {
    const output = await this.runPythonScript(this.tagsScript, [productName]);
    return output.split(',').map((t) => t.trim()).filter(Boolean);
  }

  private runPythonScript(scriptPath: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const py = spawn(this.pythonPath, [scriptPath, ...args]);
      let output = '';
      let errorOutput = '';

      py.stdout.on('data', (d) => (output += d.toString()));
      py.stderr.on('data', (d) => (errorOutput += d.toString()));

      py.on('close', (code) => {
        code === 0 ? resolve(output.trim()) : reject(new Error(errorOutput || output));
      });
    });
  }
}
