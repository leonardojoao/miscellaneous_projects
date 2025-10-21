// src/video-processing/video-processing.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { spawn } from 'child_process';
import os from 'os';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class VideoProcessingService {
  async createRandomSegmentsFromVideos(
    videoPaths: string[],
    resolution: string,
    segmentsNeeded: number,
    outputDir: string,
    segmentDurations?: number[],
  ): Promise<string[]> {
    const segments: string[] = [];

    for (let i = 0; i < segmentsNeeded; i++) {
      const randomVideo = videoPaths[Math.floor(Math.random() * videoPaths.length)];
      const duration = await this.getVideoDuration(randomVideo);

      // usa duração da lista (se fornecida) ou sorteia
      const segmentDuration = segmentDurations?.[i] ?? Math.floor(Math.random() * (7 - 3 + 1)) + 3;

      const maxStartTime = Math.max(0, duration - segmentDuration);
      const startTime = Math.random() * maxStartTime;

      const output = path.join(outputDir, `segment-${Date.now()}-${i}.mp4`);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(randomVideo)
          .setStartTime(startTime)
          .setDuration(segmentDuration)
          .videoFilters(`scale=${resolution}`)
          .noAudio()
          .output(output)
          .on('end', () => {
            segments.push(output);
            resolve();
          })
          .on('error', reject)
          .run();
      });
    }

    return segments;
  }

  /**
   * Gera cortes SEQUENCIAIS entre 5s e 7s de todos os vídeos fornecidos.
   * - Os cortes são feitos em sequência, sem repetir trechos.
   * - Cada vídeo é cortado do ponto em que o último corte terminou.
   * - Evita cortes consecutivos do mesmo vídeo.
   * - Mantém todos os segmentos organizados no diretório de saída.
   */
  async createSequentialSegmentsFromVideos(
    videoPaths: string[],
    outputDir: string,
    resolution = '1080x1920',
  ): Promise<string[]> {
    const ffmpeg = (await import('fluent-ffmpeg')).default;
    const ffmpegInstaller = (await import('@ffmpeg-installer/ffmpeg')).default;
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);

    const segments: string[] = [];
    const videoDurations: Record<string, number> = {};

    // 1️⃣ Obter a duração de cada vídeo
    for (const video of videoPaths) {
      try {
        videoDurations[video] = await this.getVideoDuration(video);
      } catch (err) {
        console.warn(`⚠️ Erro ao obter duração de ${video}:`, err);
        videoDurations[video] = 0;
      }
    }

    // 2️⃣ Map para acompanhar o progresso de cada vídeo
    const videoProgress = new Map<string, number>();
    videoPaths.forEach(v => videoProgress.set(v, 0));

    let lastVideo: string | null = null;
    let index = 1;
    let active = true;

    // 3️⃣ Loop até que todos os vídeos estejam esgotados
    while (active) {
      active = false;

      for (const currentVideo of videoPaths) {
        // Evita repetir o mesmo vídeo consecutivamente
        if (currentVideo === lastVideo) continue;

        const start = videoProgress.get(currentVideo)!;
        const duration = videoDurations[currentVideo];
        const segmentDuration = Math.floor(Math.random() * (7 - 5 + 1)) + 5;

        if (start + segmentDuration >= duration) continue; // chegou ao fim do vídeo

        // 4️⃣ Criar arquivo de saída do corte
        const output = path.join(
          outputDir,
          `segment-${String(index).padStart(3, '0')}-${path.basename(currentVideo, path.extname(currentVideo))}.mp4`
        );

        await this.cutVideoSegment(currentVideo, start, segmentDuration, output, resolution);
        segments.push(output);

        // Atualiza o progresso do vídeo
        videoProgress.set(currentVideo, start + segmentDuration + 1);
        lastVideo = currentVideo;
        index++;
        active = true;
      }
    }

    console.log(`✅ Criados ${segments.length} cortes únicos (sequenciais, entre 5s e 7s).`);
    return segments;
  }

  /**
   * Recorta um segmento do vídeo usando ffmpeg.
   */
  private cutVideoSegment(
    input: string,
    start: number,
    duration: number,
    output: string,
    resolution: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg(input)
        .setStartTime(start)
        .setDuration(duration)
        .size(resolution)
        .output(output)
        .on('end', () => {
          console.log(`✂️ Corte criado: ${path.basename(output)} (${start}s → ${start + duration}s)`);
          resolve();
        })
        .on('error', (err: any) => {
          console.error(`❌ Erro ao cortar ${path.basename(input)}:`, err);
          reject(err);
        })
        .run();
    });
  }

  async concatenateSegments(segmentPaths: string[], outputPath: string) {
    const concatListPath = path.join(__dirname, '..', '..', 'concat.txt');
    fs.writeFileSync(concatListPath, segmentPaths.map(s => `file '${s}'`).join('\n'));

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(concatListPath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions(['-c', 'copy'])
        .output(outputPath)
        .on('end', () => resolve()) // <- embrulha resolve
        .on('error', (err) => reject(err))
        .run();
    });

    fs.unlinkSync(concatListPath);
  }

  async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) return reject(err);
        const duration = metadata.format.duration;
        if (duration === undefined) {
          return reject(new Error('Could not determine video duration'));
        }
        resolve(duration);
      });
    });
  }

  async getAudioDuration(audioPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) return reject(err);

        const duration = metadata.format.duration;
        if (duration === undefined) {
          return reject(new Error("Could not determine audio duration"));
        }

        // regra: se estiver entre 2m15s (135s) e 3m (180s)
        if (duration > 135 && duration < 180) {
          // sorteia entre 181s e 195s
          const min = 181;
          const max = 195;
          const randomDuration = Math.floor(Math.random() * (max - min + 1)) + min;
          return resolve(randomDuration);
        }

        resolve(duration);
      });
    });
  }

  async mergeAudioWithVideo(videoPath: string, audioPath: string, outputPath: string, targetDuration?: number) {
    return new Promise<void>((resolve, reject) => {
      const args = ['-y', '-i', videoPath, '-i', audioPath];

      if (targetDuration) {
        // cria áudio extendido em silêncio
        const extendedAudio = path.join(path.dirname(audioPath), `extended-${Date.now()}.mp3`);
        args.splice(2, 1, extendedAudio); // substitui o audioPath pelo estendido

        spawn('ffmpeg', [
          '-y', '-i', audioPath,
          '-af', `apad=pad_dur=${targetDuration}`,
          '-t', `${targetDuration}`,
          extendedAudio
        ]).on('close', (code) => {
          if (code !== 0) return reject(new Error("Erro ao estender áudio"));

          ffmpeg()
            .input(videoPath)
            .input(extendedAudio)
            .outputOptions(['-c:v copy', '-c:a aac'])
            .save(outputPath)
            .on('end', () => {
              fs.unlinkSync(extendedAudio);
              resolve();
            })
            .on('error', reject);
        });
      } else {
        ffmpeg()
          .input(videoPath)
          .input(audioPath)
          .outputOptions(['-c:v copy', '-c:a aac'])
          .save(outputPath)
          .on('end', () => resolve())
          .on('error', reject);
      }
    });
  }

  async repeatLastSeconds(input: string, output: string, extraSeconds: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getVideoDuration(input).then((duration) => {
        const start = Math.max(duration - extraSeconds, 0);

        ffmpeg()
          .input(input)
          .inputOptions([`-ss ${start}`]) // pega últimos segundos
          .outputOptions([`-t ${extraSeconds}`]) // só o trecho necessário
          .save(`${output}.part.mp4`)
          .on('end', () => {
            // concatena original + trecho repetido
            ffmpeg()
              .input(input)
              .input(`${output}.part.mp4`)
              .on('end', () => {
                fs.unlinkSync(`${output}.part.mp4`);
                resolve();
              })
              .on('error', (err) => reject(err))
              .mergeToFile(output, os.tmpdir()); // ✅ corrigido
          })
          .on('error', (err) => reject(err))
          .run();
      });
    });
  }

  cleanupSegments(paths: string[]) {
    paths.forEach(file => fs.existsSync(file) && fs.unlinkSync(file));
  }
}
