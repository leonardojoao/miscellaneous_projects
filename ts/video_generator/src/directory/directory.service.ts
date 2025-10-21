// src/directory/directory.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class DirectoryService {
  private readonly basePath = path.join(__dirname, '..', '..', 'products');
  private readonly productLibraryPath = path.join(__dirname, '..', '..', 'product_library/shopee');
  private readonly slingshotPath = path.join(__dirname, '..', '..', 'product_library/slingshot');

  private remainingProducts: string[] = [];

  /**
   * Cria diretórios de dias do mês/ano e dentro deles subdiretórios video_1, video_2, ...
   * Copia vídeos do slingshot garantindo >= 4min de duração em cada pasta video_n.
   */
  async createVideoDirectoriesForMonthAndYear(
    month: number,
    year: number,
    videosPerDay: number
  ): Promise<string[]> {
    if (month < 1 || month > 12) {
      throw new Error('Mês inválido. Use de 1 a 12.');
    }

    const createdDirs: string[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    // Pega lista base de vídeos e embaralha
    const allVideos = fs
      .readdirSync(this.slingshotPath)
      .filter((f) => /\.(mp4|mov|mkv|avi)$/i.test(f));

    if (allVideos.length === 0) {
      throw new Error('Nenhum vídeo encontrado na pasta slingshot.');
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dd = String(day).padStart(2, '0');
      const MM = String(month).padStart(2, '0');
      const yy = String(year).slice(-2);

      const dirName = `slingshot-${dd}-${MM}-${yy}`;
      const dirPath = path.join(this.basePath, dirName);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        createdDirs.push(dirPath);

        // Cria subpastas com combinações diferentes por dia
        const shuffled = this.shuffle([...allVideos]);
        await this.fillWithVideos(dirPath, shuffled, videosPerDay);
      }
    }

    return createdDirs;
  }

  /**
   * Cria subpastas video_1, video_2, ..., preenchendo com vídeos
   * até que cada pasta tenha >= 4 minutos de duração.
   * Se os vídeos acabarem, reembaralha e continua.
   */
  private async fillWithVideos(baseDir: string, allVideos: string[], videosPerDay: number) {
    let pool = [...allVideos]; // vídeos disponíveis no ciclo atual

    for (let index = 1; index <= videosPerDay; index++) {
      const videoDir = path.join(baseDir, `video_${index}`);
      fs.mkdirSync(videoDir, { recursive: true });

      let totalDuration = 0;

      while (totalDuration < 240) {
        if (pool.length === 0) {
          // Reembaralha e recomeça
          pool = this.shuffle([...allVideos]);
        }

        const video = pool.shift()!;
        const source = path.join(this.slingshotPath, video);
        const dest = path.join(videoDir, video);

        fs.copyFileSync(source, dest);

        const duration = await this.getVideoDuration(source);
        totalDuration += duration;
      }
    }
  }

  /**
   * Retorna duração do vídeo em segundos.
   */
  private getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        const duration = metadata.format.duration || 0;
        resolve(Math.floor(duration));
      });
    });
  }

  /**
   * Embaralha array (Fisher–Yates)
   */
  

  /**
   * Cria diretórios para todos os dias do mês/ano informado
   * e copia produtos aleatórios dentro de cada diretório.
   *
   * @param month Mês (1–12)
   * @param year Ano (ex: 2025)
   * @param count Quantidade de produtos a copiar por diretório
   * @returns Lista de diretórios criados
   */
  createDirectoriesForMonthAndYear(month: number, year: number, count: number): string[] {
    if (month < 1 || month > 12) {
      throw new Error('Mês inválido. Use um número de 1 a 12.');
    }

    const createdDirs: string[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dd = String(day).padStart(2, '0');
      const MM = String(month).padStart(2, '0');
      const yy = String(year).slice(-2);

      const dirName = `product-${dd}-${MM}-${yy}`;
      const dirPath = path.join(this.basePath, dirName);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        createdDirs.push(dirPath);

        // Copiar N produtos para dentro deste diretório
        const selectedProducts = this.getRandomProducts(count);
        for (const product of selectedProducts) {
          const source = path.join(this.productLibraryPath, product);
          const destination = path.join(dirPath, product);
          this.copyRecursiveSync(source, destination);
        }
      }
    }

    return createdDirs;
  }

  /**
   * Seleciona N produtos aleatórios sem repetição até resetar.
   */
  private getRandomProducts(count: number): string[] {
    if (this.remainingProducts.length === 0) {
      const allProducts = fs
        .readdirSync(this.productLibraryPath)
        .filter((name) => fs.statSync(path.join(this.productLibraryPath, name)).isDirectory());

      this.remainingProducts = this.shuffle(allProducts);
    }

    const selected: string[] = [];
    while (selected.length < count) {
      if (this.remainingProducts.length === 0) {
        const allProducts = fs
          .readdirSync(this.productLibraryPath)
          .filter((name) => fs.statSync(path.join(this.productLibraryPath, name)).isDirectory());
        this.remainingProducts = this.shuffle(allProducts);
      }

      const product = this.remainingProducts.pop();
      if (product) selected.push(product);
    }

    return selected;
  }

  /**
   * Copia diretórios/arquivos recursivamente (tipo cp -r).
   */
  private copyRecursiveSync(src: string, dest: string) {
    const stats = fs.statSync(src);

    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }

      for (const item of fs.readdirSync(src)) {
        this.copyRecursiveSync(path.join(src, item), path.join(dest, item));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  /**
   * Embaralha array (Fisher–Yates).
   */
  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
