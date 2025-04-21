import { Injectable } from '@nestjs/common';
import { FirebaseSaveLinkData } from 'src/firebase/links/interface/links.interface';
import { FirebaseService } from 'src/firebase/links/links.service';
import { ShopeeService } from 'src/shopee/shopee.service';

@Injectable()
export class LinkProcessorService {
  constructor(
    private readonly shopeeService: ShopeeService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async processLink(link: string): Promise<void> {
    if (!link || link.trim() === '') {
      throw new Error('❌ Nenhum link foi fornecido para processamento!');
    }

    try {
      const shopeeProduct = await this.shopeeService.getShopeeProduct(link);

      if (!shopeeProduct)
        throw new Error('Não foi possível obter informações do produto.');

      const linkData: FirebaseSaveLinkData = {
        link,
        count: 0,
        statusError: false,
      };
      await this.firebaseService.saveLinkData(linkData);
    } catch (error) {
      throw error;
    }
  }
}
