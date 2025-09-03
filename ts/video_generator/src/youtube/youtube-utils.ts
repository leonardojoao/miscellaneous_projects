import * as path from 'path';
import { ProcessorService } from '../processor/processor.service';
import { YoutubeUploadService } from './youtube-upload.service';

export async function uploadAllVideos(
  processorService: ProcessorService,
  youtubeService: YoutubeUploadService,
) {
  const videos = await processorService.getAllFinalVideos();

  for (const videoPath of videos) {
    const title = path.parse(videoPath).name;
    const description = `Vídeo automático do produto ${title}`;
    const tags = ['produto', 'promoção', 'achadinho de ouro'];

    try {
      await youtubeService.uploadVideo(videoPath, title, description, tags);
    } catch (err) {
      console.error(`Erro ao enviar ${title}:`, err.message);
    }
  }
}
