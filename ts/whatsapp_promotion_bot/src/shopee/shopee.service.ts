import axios from 'axios';
import * as CryptoJS from 'crypto-js';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShopeeIds, ShopeeProduct } from './interface/shopee.interface';

@Injectable()
export class ShopeeService {
  constructor(private configService: ConfigService) {}

  extractShopeeIds(url: string): ShopeeIds | null {
    try {
      const regex = /[-.]i\.(\d+)\.(\d+)/;
      const match = url?.match(regex);

      if (match) {
        const shopId = match[1];
        const itemId = match[2];
        return { shopId, itemId };
      } else {
        throw new Error('IDs não encontrados na URL.');
      }
    } catch (error) {
      console.error('Erro ao extrair IDs:', error.message);
      throw error;
    }
  }

  async getShopeeProduct(url: string): Promise<ShopeeProduct | null> {
    const appId = this.configService.get('SHOPEE_APP_ID');
    const partnerKey = this.configService.get('SHOPEE_PARTNER_KEY');
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const { shopId, itemId } = this.extractShopeeIds(url);

    if (!shopId || !itemId) return null;

    const payload = `{"query":"query {\\n  productOfferV2(shopId: ${shopId}, itemId: ${itemId}) {\\n    nodes {\\n      itemId\\n      commissionRate\\n      sellerCommissionRate\\n      shopeeCommissionRate\\n      commission\\n      priceMax\\n      priceMin\\n      productCatIds\\n      ratingStar\\n      priceDiscountRate\\n      imageUrl\\n      productName\\n      shopId\\n      shopName\\n      shopType\\n      productLink\\n      offerLink\\n      periodStartTime\\n      periodEndTime\\n      sales\\n    }\\n    pageInfo {\\n      page\\n      limit\\n      hasNextPage\\n    }\\n  }\\n}"}`;
    const stringToSign = `${appId}${timestamp}${payload}${partnerKey}`;

    const signature = CryptoJS.SHA256(stringToSign).toString(CryptoJS.enc.Hex);

    const authHeader = `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`;

    const apiUrl = 'https://open-api.affiliate.shopee.com.br/graphql';

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });
      return response.data.data.productOfferV2.nodes[0];
    } catch (error: any) {
      console.error(
        'Erro ao obter dados do produto:',
        error?.response?.data || error.message,
      );

      throw new Error('Erro ao obter dados do produto.');
    }
  }
}
