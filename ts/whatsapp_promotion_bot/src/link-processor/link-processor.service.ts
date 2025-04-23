import { Injectable } from '@nestjs/common';
import { FirebaseLinkData } from 'src/firebase/links/interface/links.interface';
import { LinksService } from 'src/firebase/links/links.service';
import { ShopeeService } from 'src/shopee/shopee.service';
import { ParsedMessage } from './interface/link-processor.interface';

@Injectable()
export class LinkProcessorService {
  constructor(
    private readonly shopeeService: ShopeeService,
    private readonly linksService: LinksService,
  ) {}

  async processLink(data: string): Promise<void> {
    if (!data || data.trim() === '') {
      throw new Error('❌ Nenhum link foi fornecido para processamento!');
    }

    try {
      const { link, category } = this.parseMessage(data);

      const shopeeProduct = await this.shopeeService.getShopeeProduct(link);

      if (!shopeeProduct)
        throw new Error('Não foi possível obter informações do produto.');

      const linkData: FirebaseLinkData = {
        link,
        count: 0,
        category,
        statusError: false,
      };
      await this.linksService.saveLinkData(linkData);
    } catch (error) {
      throw error;
    }
  }

  parseMessage(message: string): ParsedMessage | null {
    const lines = message.trim().split('\n').filter(Boolean);

    if (lines.length >= 1) {
      const link = lines[0].trim();
      const category = lines[1]?.trim().toLowerCase() || 'geral';

      if (!link.startsWith('http')) {
        throw new Error('Não é um link valido.');
      }

      return { link, category };
    }

    throw new Error('Não foi possível realizar o parsing.');
  }
}
