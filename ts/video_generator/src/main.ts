import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DirectoryService } from './directory/directory.service';
import { ProcessorService } from './processor/processor.service';

import * as readline from 'readline';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // carrega o .env

  const app = await NestFactory.create(AppModule);
  const processorService = app.get(ProcessorService);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n📋 Menu de Opções');
  console.log('1 - Processar todos os produtos');
  console.log('2 - Sair\n');

  rl.question('Digite a opção: ', async (answer) => {
    switch (answer) {
      case '1':
        await processorService.processAllProducts();
        break;
      case '2':
        console.log('👋 Saindo...');
        break;
      default:
        console.log('❌ Opção inválida');
    }

    rl.close();
    await app.close();
  });

  // const dirService = app.get(DirectoryService);

  // Exemplo: criar diretórios para Setembro de 2025
  // const dirs = dirService.createDirectoriesForMonthAndYear(9, 2025);

  // console.log('📂 Diretórios criados:', dirs);

  // await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
