// src/shopee/shopee.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class ShopeeAffiliateService {
  private readonly logger = new Logger(ShopeeAffiliateService.name);
  private client: AxiosInstance;
  private readonly apiUrl = 'https://open-api.affiliate.shopee.com.br/graphql';
  private readonly appId = process.env.SHOPEE_APP_ID;
  private readonly secret = process.env.SHOPEE_APP_KEY;

  async init() {
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: { 'Content-Type': 'application/json' },
    });

    this.logger.log('ShopeeAffiliateService inicializado ✅');
  }

  private generateSignature(payload: string, timestamp: string): string {
    const stringToSign = `${this.appId}${timestamp}${payload}${this.secret}`;
    return crypto.createHash('sha256').update(stringToSign).digest('hex');
  }

  private async request(payload: string) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.generateSignature(payload, timestamp);

    const headers = {
      Authorization: `SHA256 Credential=${this.appId}, Timestamp=${timestamp}, Signature=${signature}`,
      'Content-Type': 'application/json',
    };

    try {
      const { data } = await this.client.post('', JSON.parse(payload), { headers });

      if (data.errors) {
        this.logger.error(`Erro na API Shopee: ${JSON.stringify(data.errors)}`);
        throw new Error('Erro na resposta da Shopee');
      }

      return data.data;
    } catch (err: any) {
      this.logger.error(
        'Erro na chamada Shopee',
        err.response?.data || err.message,
      );
      throw err;
    }
  }

  async generateAffiliateLink(
    originUrl: string,
    s1 = 's1',
    s2 = 's2',
    s3 = 's3',
    s4 = 's4',
    s5 = 's5',
  ): Promise<string> {
    const payload = `{"query":"mutation {\\n  generateShortLink(input: {\\n    originUrl: \\"${originUrl}\\",\\n    subIds: [\\"${s1}\\",\\"${s2}\\",\\"${s3}\\",\\"${s4}\\",\\"${s5}\\"]\\n  }) {\\n    shortLink\\n  }\\n}"}`;

    const data = await this.request(payload);

    if (!data?.generateShortLink) {
      throw new Error('generateShortLink não encontrado');
    }

    return data.generateShortLink.shortLink;
  }

  async getProductOfferV2(shopId: number, itemId: number): Promise<any> {
    const payload = `{"query":"query {\\n  productOfferV2(shopId: ${shopId}, itemId: ${itemId}) {\\n    nodes {\\n      itemId\\n      commissionRate\\n      sellerCommissionRate\\n      shopeeCommissionRate\\n      commission\\n      priceMax\\n      priceMin\\n      productCatIds\\n      ratingStar\\n      priceDiscountRate\\n      imageUrl\\n      productName\\n      shopId\\n      shopName\\n      shopType\\n      productLink\\n      offerLink\\n      periodStartTime\\n      periodEndTime\\n      sales\\n    }\\n    pageInfo {\\n      page\\n      limit\\n      hasNextPage\\n    }\\n  }\\n}"}`;

    const data = await this.request(payload);

    if (!data?.productOfferV2) {
      throw new Error('productOfferV2 não encontrado');
    }

    return data.productOfferV2;
  }

  async getProductOfferByUrl(productUrl: string): Promise<any> {
    // Regex para capturar os IDs no formato "-i.shopId.itemId"
    const match = productUrl.match(/-i\.(\d+)\.(\d+)/);

    if (!match) {
      throw new Error(
        `Não foi possível extrair shopId e itemId do link: ${productUrl}`,
      );
    }

    const shopId = parseInt(match[1], 10);
    const itemId = parseInt(match[2], 10);

    this.logger.debug(`Extraído shopId=${shopId}, itemId=${itemId} do link.`);

    return this.getProductOfferV2(shopId, itemId);
  }
}
