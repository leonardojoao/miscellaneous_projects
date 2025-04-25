import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { create, Whatsapp } from 'venom-bot';
import { VENOM_CONTACTS } from './venom.constants';

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
      console.error('Erro ao iniciar o Venom Bot', err);
    }
  }

  private listenMessages() {
    this.client.onMessage((message) => {
      console.log('----------------------------------------------------------');
      console.log(message);
      console.log('----------------------------------------------------------');
    });
  }

  async sendGroupMessage(groupId: string, message: string) {
    try {
      await this.client.sendText(groupId, message);
      console.log('Mensagem enviada com sucesso');
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem', error);
      throw new Error(`Erro ao enviar mensagem ${error}`);
    }
  }

  async sendLinkPreviewMessage(groupId: string, link: string, message: string) {
    try {
      await this.client.sendLinkPreview(groupId, link, link, message);
      console.log('Mensagem com preview enviada com sucesso');
    } catch (error) {
      console.error('Erro ao enviar preview', error);
      throw new Error(`Erro ao enviar preview ${error}`);
    }
  }

  async sendImageMessage(groupId: string, link: string, message: string) {
    try {
      await this.client.sendImage(groupId, link, 'image.jpg', message);
    } catch (error) {
      throw new Error(`Erro ao enviar imagem ${error}`);
    }
  }

  async addContactToGroup(groupId: string, contactId: string) {
    try {
      await this.client.addParticipant(groupId, contactId);
      this.logger.log(`Contato ${contactId} adicionado ao grupo`);
    } catch (error) {
      console.error(`Erro ao adicionar ${contactId}`, error);
      throw new Error(`Erro ao adicionar ${contactId} ${error}`);
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
      } catch (error) {
        console.error(`Erro ao adicionar ${contactId}`, error);
        throw new Error(`Erro ao adicionar ${contactId} ${error}`);
      }
    }
  }

  async joinGroup() {
    try {
      const inviteLink = this.configService.get('VENOM_INVITE_LINK');
      await this.client.joinGroup(inviteLink);
      console.log('Entrou no grupo com sucesso');
    } catch (error) {
      console.error('Erro ao entrar no grupo', error);
    }
  }
}
