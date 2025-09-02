import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DirectoryService } from './directory/directory.service';

import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // carrega o .env
  const app = await NestFactory.create(AppModule);

  // const dirService = app.get(DirectoryService);

  // Exemplo: criar diretórios para Setembro de 2025
  // const dirs = dirService.createDirectoriesForMonthAndYear(9, 2025);

  // console.log('📂 Diretórios criados:', dirs);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
