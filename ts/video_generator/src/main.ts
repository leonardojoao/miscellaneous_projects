import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DirectoryService } from './directory/directory.service';
import { ProcessorService } from './processor/processor.service';
import { YouTubeUtils } from './youtube/youtube-utils';
import { ShopeeAffiliateService } from './shopee/shopee.service';
import { AuthService } from './auth/auth.service';

import * as readline from 'readline';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // carrega o .env

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  const processorService = app.get(ProcessorService);
  const dirService = app.get(DirectoryService);
  const youtubeUtils = app.get(YouTubeUtils);
  const shopeeService = app.get(ShopeeAffiliateService);
  const authService = app.get(AuthService); // pega o serviço de autenticação

  await shopeeService.init(); // 🔑 força inicialização aqui

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function showMenu() {
    console.log('\n📋 Menu Principal');

    console.log('\n⚙️ Configurações');
    console.log('1 - Autenticar Google/YouTube');
    console.log('2 - Criar diretórios por mês/ano');

    console.log('\n🔗 Afiliados');
    console.log('3 - Validar links da Shopee');

    console.log('\n🎬 Processamento de Produtos');
    console.log('4 - Processar sem legendas');
    console.log('5 - Processar com legendas (todos)');
    console.log('6 - Processar com legendas (apenas Short Videos 9:16) + upload YouTube');
    console.log('7 - Processar com legendas (apenas video longo) + upload YouTube');
    
    console.log('\n📤 Publicação');
    console.log('8 - Enviar todos os vídeos para o YouTube');

    rl.question('Digite a opção: ', async (answer) => {
      switch (answer) {
        case '1':
          // 🔑 Fluxo de autenticação Google/YouTube
          const url = authService.getAuthUrl();
          console.log('\n1️⃣ Abra esta URL no navegador e autorize a conta:');
          console.log(url);

          rl.question('\n2️⃣ Cole o código de autorização aqui: ', async (code) => {
            try {
              const tokens = await authService.getTokens(code.trim());
              console.log('\n🎟️ Tokens recebidos:');
              console.log(tokens);

              if (tokens.refresh_token) {
                console.log('\n💾 Use este refresh token no seu .env:');
                console.log(`YT_REFRESH_TOKEN=${tokens.refresh_token}`);
              } else {
                console.log('\n⚠️ Nenhum refresh token retornado. Tente adicionar "prompt: consent" no generateAuthUrl.');
              }
            } catch (err) {
              console.error('❌ Erro ao obter tokens:', err.message);
            } finally {
              showMenu();
            }
          });
          return;
        case '2':
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
        case '3':
          await processorService.validateAllLinks();
          break;
        case '4':
          await processorService.processAllProducts();
          break;
        case '5':
          await processorService.processAllProducts({ subtitle: true });
          break;
        case '6':
          await processorService.processAllProducts({ subtitle: true, onlyShortVideo: true });
          await youtubeUtils.uploadAllVideos();
          break;
        case '8':
          await youtubeUtils.uploadAllVideos();
          break;
        case '10':
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
