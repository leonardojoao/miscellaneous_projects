import { Injectable } from '@nestjs/common';
import { FirestoneLinkData } from 'src/firebase/firestore/links/interface/links.interface';
import { LinksService } from 'src/firebase/firestore/links/links.service';
import { GroupsService } from 'src/firebase/realtime/groups/groups.service';
import { FirebaseGroupData } from 'src/firebase/realtime/groups/interface/groups.interface';
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

  async process() {
    try {
      const groups: FirebaseGroupData[] =
        await this.groupsService.getAllGroupsData();

      const categories = Array.from(
        new Set(groups.map((group) => group.category)),
      );

      const linksArray: FirestoneLinkData[][] =
        await this.getLinksByCategory(categories);

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
  ): Promise<FirestoneLinkData[][] | null> {
    try {
      const links: FirestoneLinkData[][] = [];

      for (const category of categories) {
        links.push(
          await this.linksService.getLastThreeLowestByCategory(category),
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
    try {
      for (const link of links) {
        const linkData = await this.shopeeService.getShopeeProduct(link.link);

        for (const group of groups) {
          await this.venomService.sendImageMessage(
            group.idGroup,
            `${linkData?.imageUrl}.jpg`,
            `Teste ${linkData?.offerLink}`,
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 120000));
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem', error.stack);
      throw new Error(`Erro ao enviar mensagem: ${error.message}`);
    }
  }
}
