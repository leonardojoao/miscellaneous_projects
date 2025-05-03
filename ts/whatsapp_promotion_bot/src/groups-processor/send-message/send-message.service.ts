import { Injectable } from '@nestjs/common';
import { FirestoneLinkData } from 'src/firebase/firestore/links/interface/links.interface';
import { LinksService } from 'src/firebase/firestore/links/links.service';
import { GroupsService } from 'src/firebase/realtime/groups/groups.service';
import { FirebaseGroupData } from 'src/firebase/realtime/groups/interface/groups.interface';
import { ShopeeProduct } from 'src/shopee/interface/shopee.interface';
import { ShopeeService } from 'src/shopee/shopee.service';
import { VenomService } from 'src/venom/venom.service';

@Injectable()
export class SendMessageService {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly linksService: LinksService,
    private readonly shopeeService: ShopeeService,
    private readonly venomService: VenomService,
  ) {}

  async process(quantity: number) {
    try {
      const groups: FirebaseGroupData[] =
        await this.groupsService.getAllActiveGroupsData();

      if (groups.length === 0) {
        console.log('Nenhum grupo para enviar mensagem');
        return;
      }

      const categories = Array.from(
        new Set(groups.map((group) => group.category)),
      );

      const linksArray: FirestoneLinkData[][] = await this.getLinksByCategory(
        categories,
        quantity,
      );

      if (linksArray.length === 0) {
        console.log('Nenhum link para enviar mensagem');
        return;
      }

      for (const links of linksArray) {
        const group = groups.filter(
          (group) => group.category === links[0].category,
        );

        this.sendMessages(links, group);
      }
    } catch (error) {
      console.error(
        'Erro no processamento de enviar de mensagens',
        error.stack,
      );
      throw new Error(
        `Erro no processamento de enviar de mensagens: ${error.message}`,
      );
    }
  }

  async getLinksByCategory(
    categories: string[],
    quantity: number,
  ): Promise<FirestoneLinkData[][] | null> {
    try {
      const links: FirestoneLinkData[][] = [];

      for (const category of categories) {
        links.push(
          await this.linksService.getNLowestByCategory(category, quantity),
        );
      }
      return links;
    } catch (error) {
      console.error(
        'Erro ao pegar os links relacionados a categoria',
        error.stack,
      );
      throw new Error(
        `Erro ao pegar os links relacionados a categoria: ${error.message}`,
      );
    }
  }

  async sendMessages(
    links: FirestoneLinkData[],
    groups: FirebaseGroupData[],
  ): Promise<void> {
    let currentLink: FirestoneLinkData | null = null;

    try {
      for (const link of links) {
        currentLink = link;
        const linkData: ShopeeProduct =
          await this.shopeeService.getShopeeProduct(link.link);

        const textForMessage = await this.createTextForMessage(linkData);

        for (const group of groups) {
          await this.venomService.sendImageMessage(
            group.idGroup,
            `${linkData?.imageUrl}.jpg`,
            textForMessage,
          );
        }

        const updatedLink: FirestoneLinkData = {
          ...link,
          count: link.count + 1,
        };

        await this.linksService.updateLinkData(updatedLink);

        await new Promise((resolve) => setTimeout(resolve, 120000));
      }
    } catch (error) {
      const updatedLink: FirestoneLinkData = {
        ...currentLink,
        countError: currentLink.countError + 1,
        disabled: true,
      };

      await this.linksService.updateLinkData(updatedLink);

      console.error('Erro ao enviar mensagem', error.stack, updatedLink);
      throw new Error(`Erro ao enviar mensagem: ${error.message}`);
    }
  }

  async createTextForMessage(linkData: ShopeeProduct): Promise<string> {
    try {
      const discountRate = linkData.priceDiscountRate;
      const discountedPrice = parseFloat(linkData.priceMin);

      const originalPrice = (
        discountedPrice /
        (1 - discountRate / 100)
      ).toFixed(2);

      return `
🛍️ *Super Promoções! ${linkData.productName.split(' ')[0]}!* 🛍️🔥

${this.getProductEmoji(linkData.productName)} ${linkData.productName}

De R$ ${originalPrice}

Por *R$ ${discountedPrice.toFixed(2)}* (🔥 *${discountRate}% OFF*)

🔥 Mais de *${linkData.sales}* vendidos!

*Acesse aqui* 👀: ${linkData.offerLink}
      `.trim();
    } catch (error) {
      console.error('Erro ao criar mensagem', error.stack);
      throw new Error(`Erro ao criar mensagem: ${error.message}`);
    }
  }

  getProductEmoji(productName: string): string {
    const name = productName.toLowerCase();

    if (
      name.includes('pneu') ||
      name.includes('compressor') ||
      name.includes('carro') ||
      name.includes('bike') ||
      name.includes('moto') ||
      name.includes('parafusadeira') ||
      name.includes('furadeira')
    ) {
      return '🔧'; // Ferramentas, automotivos
    }

    if (
      name.includes('chinelo') ||
      name.includes('sandália') ||
      name.includes('tênis') ||
      name.includes('bota')
    ) {
      return '🩴'; // Calçados
    }

    if (
      name.includes('fone') ||
      name.includes('cabo') ||
      name.includes('carregador') ||
      name.includes('eletrônico') ||
      name.includes('adaptador') ||
      name.includes('bluetooth')
    ) {
      return '🔌'; // Eletrônicos
    }

    if (name.includes('relógio') || name.includes('pulseira inteligente')) {
      return '⌚'; // Relógios e smartbands
    }

    if (
      name.includes('camiseta') ||
      name.includes('blusa') ||
      name.includes('vestido') ||
      name.includes('jaqueta') ||
      name.includes('roupa') ||
      name.includes('calça')
    ) {
      return '👕'; // Roupas
    }

    if (name.includes('óculos') || name.includes('óculos de sol')) {
      return '🕶️'; // Acessórios - óculos
    }

    if (
      name.includes('brinquedo') ||
      name.includes('boneca') ||
      name.includes('carrinho')
    ) {
      return '🧸'; // Brinquedos
    }

    if (
      name.includes('maquiagem') ||
      name.includes('batom') ||
      name.includes('base') ||
      name.includes('pó compacto') ||
      name.includes('rímel')
    ) {
      return '💄'; // Cosméticos
    }

    if (
      name.includes('mochila') ||
      name.includes('bolsa') ||
      name.includes('carteira')
    ) {
      return '🎒'; // Bolsas e mochilas
    }

    if (
      name.includes('jogo') ||
      name.includes('videogame') ||
      name.includes('ps4') ||
      name.includes('ps5') ||
      name.includes('xbox') ||
      name.includes('nintendo')
    ) {
      return '🎮'; // Games
    }

    if (
      name.includes('livro') ||
      name.includes('romance') ||
      name.includes('mangá') ||
      name.includes('hq')
    ) {
      return '📚'; // Livros
    }

    if (
      name.includes('smartphone') ||
      name.includes('celular') ||
      name.includes('iphone') ||
      name.includes('samsung')
    ) {
      return '📱'; // Smartphones
    }

    if (
      name.includes('cozinha') ||
      name.includes('panela') ||
      name.includes('utensílio') ||
      name.includes('liquidificador')
    ) {
      return '🍳'; // Cozinha
    }

    if (
      name.includes('decoração') ||
      name.includes('almofada') ||
      name.includes('tapete') ||
      name.includes('quadro')
    ) {
      return '🏡'; // Decoração
    }

    if (
      name.includes('fitness') ||
      name.includes('academia') ||
      name.includes('halter') ||
      name.includes('corda')
    ) {
      return '🏋️'; // Fitness / esportes
    }

    // Emoji padrão
    return '🛍️'; // Se não achar nada específico
  }
}
