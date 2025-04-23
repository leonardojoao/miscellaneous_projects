import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ChatGPTService {
  private readonly apiKey = this.configService.get('OPENAI_API_KEY');

  constructor(private configService: ConfigService) {}

  async getCategory(productDescription: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'Acesse mentalmente o link abaixo e classifique o produto citando apenas a categoria, sem introdução, sem explicações, sem frases completas e apenas em uma palavra.',
            },
            { role: 'user', content: `Produto: ${productDescription}` },
          ],
          temperature: 0,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Erro ao obter subcategoria:', error);
      throw new Error(
        'Falha ao obter subcategoria. Por favor, tente novamente.',
      );
    }
  }
}
