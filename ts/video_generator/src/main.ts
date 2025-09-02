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
  const dirService = app.get(DirectoryService);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function showMenu() {
    console.log('\n📋 Menu de Opções');
    console.log('1 - Processar todos os produtos sem legendas');
    console.log('2 - Processar todos os produtos com legendas');
    console.log('8 - Criar diretórios para um mês/ano');
    console.log('9 - Sair\n');

    rl.question('Digite a opção: ', async (answer) => {
      switch (answer) {
        case '1':
          await processorService.processAllProducts();
          break;
        case '2':
          await processorService.processAllProducts({subtitle: true});
          break;
        case '8':
          rl.question('👉 Digite o mês (1-12): ', (monthInput) => {
            rl.question('👉 Digite o ano (ex: 2025): ', (yearInput) => {
              try {
                const month = parseInt(monthInput, 10);
                const year = parseInt(yearInput, 10);

                const dirs = dirService.createDirectoriesForMonthAndYear(
                  month,
                  year,
                );

                console.log('📂 Diretórios criados:', dirs);
              } catch (err) {
                console.error('❌ Erro:', err.message);
              }

              // volta para o menu
              showMenu();
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
