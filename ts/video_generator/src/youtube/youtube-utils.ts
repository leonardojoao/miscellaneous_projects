// src/youtube/youtube-utils.ts
import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { ProcessorService } from '../processor/processor.service';
import { YoutubeUploadService } from './youtube-upload.service';
import { ShopeeAffiliateService } from '../shopee/shopee.service';

@Injectable()
export class YouTubeUtils {
  private readonly pythonPath = path.join(__dirname, '..', '..', 'venv-1.2', 'bin', 'python');
  private readonly titleScript = path.join(process.cwd(), 'src', 'scripts', 'generate_title.py');
  private readonly descriptionScript = path.join(process.cwd(), 'src', 'scripts', 'generate_description.py');
  private readonly tagsScript = path.join(process.cwd(), 'src', 'scripts', 'generate_tags.py');
  
  constructor(
    private readonly processorService: ProcessorService,
    private readonly youtubeService: YoutubeUploadService,
    private readonly shopeeService: ShopeeAffiliateService,
  ) { }

  async uploadAllVideos() {
    const basePath = this.processorService.getBasePath();
  
    // horários fixos (UTC precisa considerar fuso, ajustado para Brasília -03:00)
    const publishHours = [8, 12, 19];
  
    const dateDirs = fs
      .readdirSync(basePath)
      .filter((name) => fs.statSync(path.join(basePath, name)).isDirectory());
  
    for (const dateDir of dateDirs) {
      const datePath = path.join(basePath, dateDir);
  
      const productDirs = fs
        .readdirSync(datePath)
        .filter((name) => fs.statSync(path.join(datePath, name)).isDirectory());
  
      // Agrupamento de vídeos por data
      const videosByDate: Record<string, { video: string; link: string }[]> = {};
  
      for (const productDir of productDirs) {
        const dirPath = path.join(datePath, productDir);
  
        // tenta ler o link.txt
        const linkFile = path.join(dirPath, 'link.txt');
        if (!fs.existsSync(linkFile)) continue;
        const link = fs.readFileSync(linkFile, 'utf-8').trim();
  
        const videos = fs
          .readdirSync(dirPath)
          .filter(
            (f) =>
              f === 'video-audio_longo-final.mp4' ||
              f === 'video-audio_curto-legendado.mp4',
          )
          .map((f) => path.join(dirPath, f));
  
        if (videos.length === 0) continue;
  
        // extrai data a partir do nome do diretório product-01-09-25
        const parts = datePath.split(path.sep);
        const productFolder = parts.find((p) => p.startsWith('product-'));
        if (!productFolder) continue;
  
        const [, day, month, year] = productFolder.split('-'); // product-01-09-25
        const fullYear = `20${year}`;
        const dateKey = `${fullYear}-${month}-${day}`; // YYYY-MM-DD
  
        if (!videosByDate[dateKey]) {
          videosByDate[dateKey] = [];
        }
  
        for (const video of videos) {
          videosByDate[dateKey].push({ video, link });
        }
      }
  
      // Processa os vídeos daquele dia
      for (const dateKey of Object.keys(videosByDate)) {
        const dailyVideos = videosByDate[dateKey];
  
        for (let i = 0; i < dailyVideos.length; i++) {
  
          const { video, link } = dailyVideos[i];
  
          const dataProduct = await this.shopeeService.getProductOfferByUrl(link);
          const productName = dataProduct.nodes[0].productName;
          const productLink = dataProduct.nodes[0].offerLink;
  
          // Usa o link para montar os metadados
          const title = await this.generateTitle(productName);
          const description = await this.generateDescription(productName, productLink);
          const tags = await this.generateTags(productName);
  
          // Define hora baseada no índice
          const hour = publishHours[i % publishHours.length];
  
          // Cria objeto Date em horário de Brasília
          const localDate = new Date(
            `${dateKey}T${hour.toString().padStart(2, '0')}:00:00-03:00`,
          );
          const publishAtUTC = new Date(localDate.toISOString());
  
          try {
            await this.youtubeService.uploadVideo(
              video,
              title,
              description,
              tags,
              publishAtUTC,
            );
            console.log(`✅ ${path.basename(video)} agendado para ${publishAtUTC.toISOString()}`);
          } catch (err: any) {
            console.error(`❌ Erro ao enviar ${video}:`, err.message);
          }
        }
      }
    }
  }
  
  async generateTitle(productName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const py = spawn(this.pythonPath, [this.titleScript, productName]);
  
      let output = '';
      let errorOutput = '';
  
      py.stdout.on('data', (data) => {
        output += data.toString();
      });
  
      py.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
  
      py.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`Erro ao executar script Python: ${errorOutput || output}`));
        }
      });
    });
  }
  
  async generateDescription(productName: string, link: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const py = spawn(this.pythonPath, [this.descriptionScript, productName, link]);
  
      let output = '';
      let errorOutput = '';
  
      py.stdout.on('data', (data) => {
        output += data.toString();
      });
  
      py.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
  
      py.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`Erro ao executar script Python: ${errorOutput || output}`));
        }
      });
    });
  }
  
  async generateTags(productName: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const py = spawn(this.pythonPath, [this.tagsScript, productName]);
  
      let output = '';
      let errorOutput = '';
  
      py.stdout.on('data', (data) => {
        output += data.toString();
      });
  
      py.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
  
      py.on('close', (code) => {
        if (code === 0) {
          // Converte string CSV em array de strings e remove espaços extras
          const tagsArray = output
            .trim()
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0); // remove strings vazias
          resolve(tagsArray);
        } else {
          reject(new Error(`Erro ao executar script Python: ${errorOutput || output}`));
        }
      });
    });
  }
}
