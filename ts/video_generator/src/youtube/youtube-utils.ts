import * as path from 'path';
import { ProcessorService } from '../processor/processor.service';
import { YoutubeUploadService } from './youtube-upload.service';

export async function uploadAllVideos(
  processorService: ProcessorService,
  youtubeService: YoutubeUploadService,
) {
  const videos = await processorService.getAllFinalVideos();

  console.log(`Total de vídeos para enviar: ${videos.length}`);

  // Agrupa vídeos por data extraída do nome da pasta
  const videosByDate: Record<string, string[]> = {};
  for (const videoPath of videos) {
    const parts = videoPath.split(path.sep);
    const productFolder = parts.find((p) => p.startsWith('product-'));
    if (!productFolder) continue;

    const [, day, month, year] = productFolder.split('-'); // product-01-09-25
    const fullYear = `20${year}`; // vira 2025
    const dateKey = `${fullYear}-${month}-${day}`; // 2025-09-01 (ISO format YYYY-MM-DD)

    if (!videosByDate[dateKey]) {
      videosByDate[dateKey] = [];
    }
    videosByDate[dateKey].push(videoPath);
  }

  console.log('📅 Vídeos agrupados por data:', videosByDate);

  // Horários fixos (UTC precisa considerar fuso, ajustei para Brasília -03:00)
  const publishHours = [8, 12, 19];

  for (const dateKey of Object.keys(videosByDate)) {
    const dailyVideos = videosByDate[dateKey];

    for (let i = 0; i < dailyVideos.length; i++) {
      const videoPath = dailyVideos[i];
      const title = path.parse(videoPath).name;
      const description = `Vídeo automático do produto ${title}`;
      const tags = ['produto', 'promoção', 'achadinho de ouro'];

      // Define hora baseada no índice
      const hour = publishHours[i % publishHours.length];

      // Cria objeto Date em horário de Brasília
      const localDate = new Date(`${dateKey}T${hour.toString().padStart(2, '0')}:00:00-03:00`);
      const publishAtUTC = new Date(localDate.toISOString());

      try {
        await youtubeService.uploadVideo(
          videoPath,
          title,
          description,
          tags,
          publishAtUTC, // envia no fuso certo
        );
        console.log(`✅ ${title} agendado para ${publishAtUTC.toISOString()}`);
      } catch (err) {
        console.error(`❌ Erro ao enviar ${title}:`, err.message);
      }
    }
  }
}
