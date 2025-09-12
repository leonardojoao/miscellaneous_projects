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
          // sorteia entre 180s e 195s
          const min = 180;
          const max = 195;
          const randomDuration = Math.floor(Math.random() * (max - min + 1)) + min;
          return resolve(randomDuration);
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
