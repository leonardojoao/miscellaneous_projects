import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ContactsProcessorService } from './contacts-processor.service';
import { FirebaseContactData } from 'src/firebase/realtime/contacts/interface/contacts.interface';

@Controller('contacts-processor')
export class ContactsProcessorController {
  constructor(
    private readonly contactsProcessorService: ContactsProcessorService,
  ) {}

  @Post()
  async createContactsProcessor(
    @Body() contactProcessorData: FirebaseContactData,
  ): Promise<{ message: string }> {
    try {
      await this.contactsProcessorService.saveContactsProcessorData(
        contactProcessorData,
      );
      return { message: 'Contato criado com sucesso!' };
    } catch (error) {
      console.error('Erro ao processar o contato', error.stack);

      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('batch')
  async createContactsProcessorBatch(
    @Body() contactsProcessorData: FirebaseContactData[],
  ): Promise<{ message: string; errors?: string[] }> {
    const errors: string[] = [];

    for (const contactProcessor of contactsProcessorData) {
      try {
        await this.contactsProcessorService.saveContactsProcessorData(
          contactProcessor,
        );
      } catch (error) {
        console.error(
          `Erro no contato com phone "${contactProcessor.phone}": ${error.message}`,
        );
        errors.push(error.message);
      }
    }

    if (errors.length > 0) {
      return {
        message: 'Processamento parcial concluido com erros!',
        errors,
      };
    }

    return { message: 'Contatos criados com sucesso!' };
  }
}
