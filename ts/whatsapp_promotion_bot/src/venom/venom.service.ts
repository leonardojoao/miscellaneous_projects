import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { create, Whatsapp } from 'venom-bot';
import { VENOM_CONTACTS, DEFAULT_MESSAGE } from './venom.constants';

@Injectable()
export class VenomService implements OnModuleInit {
  private client: Whatsapp;
  private readonly logger = new Logger(VenomService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.client = await create({
        session: this.configService.get('VENOM_SESSION'),
        headless: 'new',
        browserArgs: ['--no-sandbox'],
      });

      this.listenMessages();
    } catch (err) {
      this.logger.error('Erro ao iniciar o Venom Bot', err);
    }
  }

  private listenMessages() {
    this.client.onMessage((message) => {
      console.log('----------------------------------------------------------');
      console.log(message);
      console.log('----------------------------------------------------------');
    });
  }

  async sendGroupMessage() {
    try {
      const groupId = this.configService.get('VENOM_GROUP_ID');
      await this.client.sendText(groupId, DEFAULT_MESSAGE);
      this.logger.log('Mensagem enviada com sucesso');
    } catch (err) {
      this.logger.error('Erro ao enviar mensagem', err);
    }
  }

  async sendLinkPreviewMessage() {
    const groupId = this.configService.get('VENOM_GROUP_ID');
    const link = this.configService.get('VENOM_LINK');
    try {
      await this.client.sendLinkPreview(groupId, link, link, DEFAULT_MESSAGE);
      this.logger.log('Mensagem com preview enviada com sucesso');
    } catch (err) {
      this.logger.error('Erro ao enviar preview', err);
    }
  }

  async sendImageMessage(link: string, message: string) {
    const groupId = this.configService.get('VENOM_GROUP_ID');
    try {
      await this.client.sendImage(groupId, link, 'image.jpg', message);
    } catch (error) {
      throw new Error(`Erro ao enviar imagem ${error}`);
    }
  }

  async addContactsToGroup() {
    const groupId = this.configService.get('VENOM_GROUP_ID');

    for (const contactId of VENOM_CONTACTS) {
      const delay = Math.floor(Math.random() * (300000 - 120000 + 1)) + 120000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        await this.client.addParticipant(groupId, contactId);
        this.logger.log(`Contato ${contactId} adicionado ao grupo`);
      } catch (err) {
        this.logger.error(`Erro ao adicionar ${contactId}`, err);
      }
    }
  }

  async joinGroup() {
    try {
      const inviteLink = this.configService.get('VENOM_INVITE_LINK');
      await this.client.joinGroup(inviteLink);
      this.logger.log('Entrou no grupo com sucesso');
    } catch (err) {
      this.logger.error('Erro ao entrar no grupo', err);
    }
  }
}
