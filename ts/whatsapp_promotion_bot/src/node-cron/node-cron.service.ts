import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';

import { SendMessageService } from 'src/groups-processor/send-message/send-message.service';
import { AddContactService } from 'src/groups-processor/add-contact/add-contact.service';

@Injectable()
export class NodeCronService implements OnModuleInit {
  constructor(
    private readonly sendMessageService: SendMessageService,
    private readonly addContactService: AddContactService,
  ) {}

  async onModuleInit() {
    // 01:00
    cron.schedule('0 1 * * *', () => {
      this.execProcessingToAddContact();
    });

    // 06:45
    cron.schedule('45 6 * * *', () => {
      this.execProcessingToSendMessage();
    });

    // 11:55
    cron.schedule('55 11 * * *', () => {
      this.execProcessingToSendMessage();
    });

    // 17:55
    cron.schedule('55 17 * * *', () => {
      this.execProcessingToSendMessage();
    });

    // 20:00
    cron.schedule('0 20 * * *', () => {
      this.execProcessingToSendMessage();
    });
  }

  execProcessingToSendMessage() {
    try {
      console.log(`Iniciando processamento: ${new Date().toLocaleString()}`);
      this.sendMessageService.process();
    } catch (error) {
      console.error('Erro no processamento', error.message);
    }
  }

  execProcessingToAddContact() {
    try {
      console.log(`Iniciando processamento: ${new Date().toLocaleString()}`);
      this.addContactService.process();
    } catch (error) {
      console.error('Erro no processamento', error.message);
    }
  }
}
