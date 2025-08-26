// src/video-processing/video-processing.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class VideoProcessingService {
  async createRandomSegmentsFromVideos(
    videoPaths: string[],
    resolution: string,
    segmentDuration: number,
    segmentsNeeded: number,
    outputDir: string,
  ): Promise<string[]> {
    const segments: string[] = [];

    for (let i = 0; i < segmentsNeeded; i++) {
      const randomVideo = videoPaths[Math.floor(Math.random() * videoPaths.length)];

      const duration = await this.getVideoDuration(randomVideo);


      // Define o startTime para garantir que o segmento caiba dentro do vídeo
      const maxStartTime = Math.max(0, duration - segmentDuration);
      const startTime = Math.random() * maxStartTime;

      const output = path.join(outputDir, `segment-${Date.now()}-${i}.mp4`);
      // const startTime = Math.floor(Math.random() * 30); // TODO: melhorar com duração real do vídeo

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
          return reject(new Error('Could not determine audio duration'));
        }
        resolve(duration);
      });
    });
  }

  async mergeAudioWithVideo(videoPath: string, audioPath: string, outputPath: string) {
    return new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v copy',   // mantém o vídeo sem recodificar
          '-c:a aac',    // converte o áudio para AAC
          '-shortest',   // garante que não ultrapasse o tamanho do áudio/vídeo
        ])
        .save(outputPath)
        .on('end', () => resolve())
        .on('error', reject);
    });
  }

  cleanupSegments(paths: string[]) {
    paths.forEach(file => fs.existsSync(file) && fs.unlinkSync(file));
  }
}
