import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DirectoryService } from './directory/directory.service';
import { ProcessorService } from './processor/processor.service';
import { YouTubeUtils } from './youtube/youtube-utils';
import { ShopeeAffiliateService } from './shopee/shopee.service';
import { AuthService } from './auth/auth.service';

import * as readline from 'readline/promises';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  const dirService = app.get(DirectoryService);
  const processorService = app.get(ProcessorService);
  const youtubeUtils = app.get(YouTubeUtils);
  const shopeeService = app.get(ShopeeAffiliateService);
  const authService = app.get(AuthService);

  await shopeeService.init();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = async (question: string) => rl.question(`${question.trim()} `);

  const askMonthYearCount = async () => {
    const month = parseInt(await ask('👉 Mês (1-12):'), 10);
    const year = parseInt(await ask('👉 Ano (ex: 2025):'), 10);
    const count = parseInt(await ask('👉 Quantidade de produtos:'), 10);

    if ([month, year, count].some(isNaN)) throw new Error('Entradas inválidas.');
    if (count < 1) throw new Error('A quantidade deve ser pelo menos 1.');

    return { month, year, count };
  };

  async function handleAuthFlow() {
    console.log('\n🔑 Iniciando autenticação Google/YouTube...');
    const url = authService.getAuthUrl();
    console.log('\n1️⃣ Abra esta URL no navegador e autorize sua conta:');
    console.log(url);

    const code = await ask('\n2️⃣ Cole o código de autorização aqui:');
    try {
      const tokens = await authService.getTokens(code.trim());
      console.log('\n🎟️ Tokens recebidos:', tokens);

      if (tokens.refresh_token) {
        console.log('\n💾 Adicione ao seu .env:');
        console.log(`YT_REFRESH_TOKEN=${tokens.refresh_token}`);
      } else {
        console.warn('\n⚠️ Nenhum refresh token retornado. Use "prompt: consent" na URL.');
      }
    } catch (err: any) {
      console.error('❌ Erro ao autenticar:', err.message);
    }
  }

  async function handleCreateDirectories(useVideoVariant = false) {
    try {
      const { month, year, count } = await askMonthYearCount();
      const dirs = useVideoVariant
        ? dirService.createVideoDirectoriesForMonthAndYear(month, year, count)
        : dirService.createDirectoriesForMonthAndYear(month, year, count);

      console.log('📂 Diretórios criados:', dirs);
    } catch (err: any) {
      console.error('❌ Erro ao criar diretórios:', err.message);
    }
  }

  async function mainMenu(): Promise<void> {
    console.log('\n⚙️  Configurações');
    console.log('1 - Autenticar Google/YouTube');
    console.log('2 - Criar diretórios (produtos)');
    console.log('3 - Criar diretórios (vídeos)');

    console.log('\n🔗 Afiliados');
    console.log('4 - Validar links da Shopee');

    console.log('\n🎬 Processamento de Produtos');
    console.log('5 - Processar sem legendas');
    console.log('6 - Processar com legendas (todos)');
    console.log('7 - Processar Shorts + upload YouTube');
    console.log('8 - Processar vídeos longos + upload YouTube');

    console.log('\n🎬 Processamento de SlingShot');
    console.log('9 - Processar sequencial + upload YouTube');

    console.log('\n📤 Publicação');
    console.log('10 - Upload sequencial YouTube');
    console.log('11 - Upload todos os vídeos YouTube');

    console.log('\n0 - Sair');
    console.log('='.repeat(50));

    const choice = await ask('Digite a opção:');

    try {
      switch (choice) {
        case '1':
          await handleAuthFlow();
          break;
        case '2':
          await handleCreateDirectories();
          break;
        case '3':
          await handleCreateDirectories(true);
          break;
        case '4':
          await processorService.validateAllLinks();
          break;
        case '5':
          await processorService.processAllProducts();
          break;
        case '6':
          await processorService.processAllProducts({ subtitle: true });
          break;
        case '7':
          await processorService.processAllProducts({ subtitle: true, onlyShortVideo: true });
          await youtubeUtils.uploadAllVideos();
          break;
        case '8':
          await processorService.processAllProducts({ subtitle: true, onlyLongVideo: true });
          await youtubeUtils.uploadAllVideos();
          break;
        case '9':
          await processorService.processAllProducts({ mode: 'sequential' });
          await youtubeUtils.uploadAllVideos({ mode: 'sequential' });
          break;
        case '10':
          console.log('⏳ Upload sequencial...');
          await youtubeUtils.uploadAllVideos({ mode: 'sequential' });
          break;
        case '11':
          await youtubeUtils.uploadAllVideos();
          break;
        case '12':
          await processorService.processAllProducts({ subtitle: true, onlyShortVideo: true, mode: 'continuous' });
        case '0':
          console.log('👋 Encerrando aplicação...');
          await app.close();
          rl.close();
          process.exit(0);
        default:
          console.log('❌ Opção inválida.');
      }
    } catch (err: any) {
      console.error('❌ Erro na execução da opção:', err.message);
    }

    await mainMenu(); // loop do menu
  }

  await mainMenu();
}

bootstrap().catch((err) => {
  console.error('💥 Erro fatal ao iniciar aplicação:', err);
  process.exit(1);
});
