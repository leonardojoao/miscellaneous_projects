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

    /**
   * Usa um único vídeo, repetindo-o em loop até preencher a duração total do áudio.
   * - Se o vídeo for mais longo que o áudio, corta o vídeo.
   * - Se o vídeo for mais curto, repete em loop até atingir o tempo do áudio.
   * - Ao final, sincroniza o áudio e o vídeo e exporta o arquivo final.
   */
  async processSingleVideoWithAudio(
    videoPath: string,
    audioPath: string,
    outputDir: string,
    resolution = '1080x1920',
  ): Promise<string> {
    const videoName = path.basename(videoPath);
    const audioName = path.basename(audioPath);
    const finalOutput = path.join(outputDir, `final-${path.parse(audioName).name}.mp4`);

    console.log(`🎬 Processando vídeo único com áudio:`);
    console.log(`📹 ${videoName}`);
    console.log(`🎵 ${audioName}`);

    const videoDuration = await this.getVideoDuration(videoPath);
    const audioDuration = await this.getAudioDuration(audioPath);

    console.log(`⏱️ Duração do vídeo: ${videoDuration.toFixed(2)}s`);
    console.log(`⏱️ Duração do áudio: ${audioDuration.toFixed(2)}s`);

    // 🔹 Ajusta o vídeo conforme a duração do áudio
    let processedVideo = videoPath;

    if (videoDuration < audioDuration) {
      // 🔁 Repetir o vídeo até completar o tempo do áudio
      console.log(`🔁 Repetindo vídeo até ${audioDuration.toFixed(2)}s...`);
      const loopedVideo = path.join(outputDir, `looped-${path.basename(videoPath)}`);
      await this.loopVideoUntilDuration(videoPath, loopedVideo, audioDuration, resolution);
      processedVideo = loopedVideo;
    } else if (videoDuration > audioDuration) {
      // ✂️ Cortar vídeo se for maior
      console.log(`✂️ Cortando vídeo para ${audioDuration.toFixed(2)}s...`);
      const trimmedVideo = path.join(outputDir, `trimmed-${path.basename(videoPath)}`);
      await this.trimVideoToDuration(videoPath, trimmedVideo, audioDuration, resolution);
      processedVideo = trimmedVideo;
    }

    // 🔊 Mescla áudio e vídeo
    await this.mergeAudioWithVideoV2(processedVideo, audioPath, finalOutput);

    // 🔥 Remove intermediários, se criados
    if (processedVideo !== videoPath && fs.existsSync(processedVideo)) {
      fs.unlinkSync(processedVideo);
    }

    console.log(`✅ Vídeo final criado: ${finalOutput}`);
    return finalOutput;
  }

  /**
   * 🔁 Repete o vídeo até atingir uma duração alvo (em segundos)
   */

  async loopVideoUntilDuration(
    input: string,
    output: string,
    targetDuration: number,
    resolution = '1080x1920',
  ): Promise<void> {
    const videoDuration = await this.getVideoDuration(input);
    const loops = Math.ceil(targetDuration / videoDuration);

    const listFile = path.join(path.dirname(output), 'concat_list.txt');
    const content = Array(loops).fill(`file '${input}'`).join('\n');
    fs.writeFileSync(listFile, content);

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(listFile)
        .inputOptions(['-f concat', '-safe 0'])
        .videoFilters(`scale=${resolution}`)
        .outputOptions([
          '-c:v libx264', // ✅ reencoda, necessário por causa do scale
          '-preset ultrafast',
          '-c:a aac',
        ])
        .save(output)
        .on('end', () => resolve())
        .on('error', reject);
    });

    fs.unlinkSync(listFile);
  }


  /**
   * ✂️ Corta o vídeo até atingir uma duração exata
   */
  async trimVideoToDuration(
    input: string,
    output: string,
    targetDuration: number,
    resolution = '1080x1920',
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(input)
        .setStartTime(0)
        .setDuration(targetDuration)
        .videoFilters(`scale=${resolution}`)
        .outputOptions(['-c:v libx264', '-c:a copy'])
        .save(output)
        .on('end', () => resolve())
        .on('error', reject);
    });
  }

  async mergeAudioWithVideoV2(
    videoPath: string,
    audioPath: string,
    outputPath: string,
    targetDuration?: number
  ) {
    return new Promise<void>((resolve, reject) => {
      const extendedAudio = path.join(path.dirname(audioPath), `extended-${Date.now()}.mp3`);

      const finalizeMerge = (audioToUse: string) => {
        ffmpeg()
          .input(videoPath)
          .input(audioToUse)
          // remove áudio original e aplica o novo
          .outputOptions([
            '-map 0:v:0', // pega apenas o vídeo do primeiro input
            '-map 1:a:0', // pega apenas o áudio do segundo input
            '-c:v libx264', // reencoda para aplicar filtros
            '-preset ultrafast',
            '-c:a aac', // converte áudio para AAC
            '-shortest', // termina no menor stream (vídeo ou áudio)
            '-pix_fmt yuv420p' // garante compatibilidade ampla
          ])
          .videoFilters('scale=1080x1920') // redimensiona para 1080x1920
          .on('end', () => {
            if (fs.existsSync(extendedAudio)) fs.unlinkSync(extendedAudio);
            resolve();
          })
          .on('error', (err) => reject(err))
          .save(outputPath);
      };

      // 🔊 Se precisar estender o áudio até o targetDuration
      if (targetDuration) {
        spawn('ffmpeg', [
          '-y',
          '-i', audioPath,
          '-af', `apad=pad_dur=${targetDuration}`,
          '-t', `${targetDuration}`,
          extendedAudio
        ]).on('close', (code) => {
          if (code !== 0) return reject(new Error("Erro ao estender áudio"));
          finalizeMerge(extendedAudio);
        });
      } else {
        finalizeMerge(audioPath);
      }
    });
  }

  async concatenateFinalVideos(dateDirPath: string, outputPath: string) {
    const ffmpeg = (await import('fluent-ffmpeg')).default;
    const fs = await import('fs');
    const path = await import('path');

    // Busca todos os vídeos final-audio_curto.mp4 dentro dos produtos
    const productDirs = fs.readdirSync(dateDirPath).filter((f) =>
      fs.statSync(path.join(dateDirPath, f)).isDirectory()
    );

    const finalVideos = productDirs
      .map((dir) => path.join(dateDirPath, dir, 'final-audio_curto.mp4'))
      .filter((file) => fs.existsSync(file));

    if (!finalVideos.length) {
      console.warn(`⚠️ Nenhum vídeo final encontrado em ${dateDirPath}`);
      return;
    }

    // Cria lista temporária para concatenação
    const listFile = path.join(dateDirPath, 'videos.txt');
    fs.writeFileSync(listFile, finalVideos.map((v) => `file '${v}'`).join('\n'));

    console.log(`🎬 Concatenando ${finalVideos.length} vídeos em ${outputPath}`);

    return new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(listFile)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c copy'])
        .save(outputPath)
        .on('end', () => {
          fs.unlinkSync(listFile);
          console.log(`✅ Vídeo final criado: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          fs.unlinkSync(listFile);
          reject(err);
        });
    });
  }


}
