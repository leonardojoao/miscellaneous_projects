import { Injectable } from '@nestjs/common';
import { Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { LinkProcessorService } from 'src/link-processor/link-processor.service';

@Update()
@Injectable()
export class TelegramService {
  constructor(private readonly linkProcessorService: LinkProcessorService) {}

  @Start()
  start(@Ctx() ctx: Context) {
    return ctx.reply('🚀 Olá! Bem-vindo ao meu bot NestJS!');
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    if (ctx.message && 'text' in ctx.message) {
      const receivedText = ctx.message.text;

      try {
        await this.linkProcessorService.processLink(receivedText);
        return ctx.reply('✅ Link recebido e processado com sucesso!');
      } catch (error) {
        console.error(error.message);
        return ctx.reply('❌ Link recebido e ocorreu erro no processamento!');
      }
    } else {
      return ctx.reply('❌ Isso não parece um link válido.');
    }
  }
}
