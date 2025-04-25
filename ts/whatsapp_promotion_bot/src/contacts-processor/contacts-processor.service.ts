import { Injectable } from '@nestjs/common';
import { ContactsService } from 'src/firebase/realtime/contacts/contacts.service';
import { FirebaseContactData } from 'src/firebase/realtime/contacts/interface/contacts.interface';

@Injectable()
export class ContactsProcessorService {
  constructor(private readonly contactsService: ContactsService) {}

  async saveContactsProcessorData(data: FirebaseContactData): Promise<void> {
    const { name, phone, category } = data;

    if (!name || !phone || !category) {
      throw new Error(
        'Todos os campos devem ser preenchidos para cadastrar um contato!',
      );
    }

    try {
      const contact = await this.contactsService.getByIdContactData(phone);

      if (contact) {
        console.warn(`Já existe um contato cadastrado com o phone: ${phone}.`);
        throw new Error(
          `Já existe um contato cadastrado com o phone: ${phone}.`,
        );
      }

      await this.contactsService.saveContactData(data);
      console.log(`Dados salvos com sucesso para o contato: ${phone}`);
    } catch (error) {
      console.error(
        `Erro ao criar contato para o phone: ${phone}`,
        error.stack,
      );
      throw new Error(`Falha ao criar contato para o phone: ${error.message}`);
    }
  }
}
