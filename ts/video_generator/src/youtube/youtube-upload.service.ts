// src/youtube/youtube-upload.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';

@Injectable()
export class YoutubeUploadService {
  private readonly logger = new Logger(YoutubeUploadService.name);

  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YT_CLIENT_ID,
      process.env.YT_CLIENT_SECRET,
      process.env.YT_REDIRECT_URI,
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.YT_REFRESH_TOKEN,
    });
  }

  async uploadVideo(
    filePath: string,
    title: string,
    description: string,
    tags: string[] = [],
    publishAt?: Date // se passar uma data, o vídeo será agendado
  ) {
    const youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client,
    });

    this.logger.log(`📤 Iniciando upload: ${filePath}`);

    try {
      const res = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId: '22',
          },
          status: {
            privacyStatus: publishAt ? 'private' : 'unlisted', // se tiver data, deixa private
            ...(publishAt
              ? { publishAt: publishAt.toISOString() } // agenda a publicação
              : {}),
          },
        },
        media: {
          body: fs.createReadStream(filePath),
        },
      });

      if (publishAt) {
        this.logger.log(
          `✅ Upload concluído! Video ID: ${res.data.id} | Agendado para: ${publishAt.toISOString()}`
        );
      } else {
        this.logger.log(`✅ Upload concluído! Video ID: ${res.data.id}`);
      }

      return res.data;
    } catch (err) {
      this.logger.error('❌ Erro no upload para o YouTube', err);
      throw err;
    }
  }
}
