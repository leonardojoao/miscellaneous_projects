import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DirectoryService } from './directory/directory.service';
import { ProcessorService } from './processor/processor.service';
import { uploadAllVideos } from './youtube/youtube-utils';
import { YoutubeUploadService } from './youtube/youtube-upload.service';
import { ShopeeAffiliateService } from './shopee/shopee.service';

import * as readline from 'readline';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // carrega o .env

  const app = await NestFactory.create(AppModule);

  const processorService = app.get(ProcessorService);
  const dirService = app.get(DirectoryService);
  const youtubeService = app.get(YoutubeUploadService);
  const shopeeService = app.get(ShopeeAffiliateService);

  await shopeeService.init(); // 🔑 força inicialização aqui

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function showMenu() {
    console.log('\n📋 Menu de Opções');
    console.log('1 - Processar todos os produtos sem legendas');
    console.log('2 - Processar todos os produtos com legendas');
    console.log('7 - (Futuro) Enviar todos os vídeos para o YouTube');
    console.log('8 - Criar diretórios para um mês/ano');
    console.log('9 - Sair\n');

    rl.question('Digite a opção: ', async (answer) => {
      switch (answer) {
        case '1':
          await processorService.processAllProducts();
          break;
        case '2':
          await processorService.processAllProducts({ subtitle: true });
          break;
        case '7':
          await uploadAllVideos(processorService, youtubeService);
          break;
        case '8':
          rl.question('👉 Digite o mês (1-12): ', (monthInput) => {
            rl.question('👉 Digite o ano (ex: 2025): ', (yearInput) => {
              rl.question('👉 Digite a quantidade de produtos: ', (countInput) => {
                try {
                  const month = parseInt(monthInput, 10);
                  const year = parseInt(yearInput, 10);
                  const count = parseInt(countInput, 10);

                  if (isNaN(month) || isNaN(year) || isNaN(count)) {
                    throw new Error('Entrada inválida. Use números válidos.');
                  }

                  if (count < 1) {
                    throw new Error('A quantidade de produtos deve ser pelo menos 1.');
                  }

                  // cria os diretórios e copia os produtos
  
                  const dirs = dirService.createDirectoriesForMonthAndYear(
                    month,
                    year,
                    count,
                  );
  
                  console.log('📂 Diretórios criados:', dirs);
                } catch (err) {
                  console.error('❌ Erro:', err.message);
                }
  
                // volta para o menu
                showMenu();
              });
            });
          });
          return; // evita cair no showMenu duplicado
        case '9':
          console.log('👋 Saindo...');
          rl.close();
          await app.close();
          return;
        default:
          console.log('❌ Opção inválida');
      }

      showMenu(); // mostra o menu novamente após a ação
    });
  }

  showMenu(); // inicia o menu
}

bootstrap();
