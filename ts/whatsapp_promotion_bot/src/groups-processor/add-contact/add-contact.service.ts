import { Injectable } from '@nestjs/common';
import { ContactsService } from 'src/firebase/realtime/contacts/contacts.service';
import { FirebaseContactData } from 'src/firebase/realtime/contacts/interface/contacts.interface';
import { GroupsService } from 'src/firebase/realtime/groups/groups.service';
import { FirebaseGroupData } from 'src/firebase/realtime/groups/interface/groups.interface';
import { VenomService } from 'src/venom/venom.service';

@Injectable()
export class AddContactService {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly groupsService: GroupsService,
    private readonly venomService: VenomService,
  ) {}

  async process(withoutInterval: boolean = false) {
    try {
      const contacts: FirebaseContactData[] =
        await this.contactsService.getLast30AddContactsData();

      if (contacts.length === 0) {
        console.log('Nenhum contato para adicionar no grupo');
        return;
      }

      const groups: FirebaseGroupData[] =
        await this.groupsService.getAllAddContactsGroupsData();

      if (groups.length === 0) {
        console.log('Nenhum grupo para adicionar contato');
        return;
      }

      this.addContactsInGroup(contacts, groups, withoutInterval);
    } catch (error) {
      console.error(
        'Erro no processamento de adicionar contatos no grupo',
        error.stack,
      );
      throw new Error(
        `Erro no processamento de adicionar contatos no grupo: ${error.message}`,
      );
    }
  }

  async addContactsInGroup(
    contacts: FirebaseContactData[],
    groups: FirebaseGroupData[],
    withoutInterval: boolean = false,
  ) {
    try {
      for (const contact of contacts) {
        const group = groups.find(
          (group) => group.category === contact.category,
        );

        if (!withoutInterval) {
          const randomInterval =
            Math.floor(Math.random() * (300000 - 120000 + 1)) + 120000;

          // Aguardar o intervalo antes de adicionar o próximo contato
          await new Promise((resolve) => setTimeout(resolve, randomInterval));
        }
        // Intervalo aleatório entre 2 a 5 minutos (em milissegundos)

        await this.venomService.addContactToGroup(group.idGroup, contact.phone);
        console.log(
          `Contato ${contact.name} adicionado ao grupo ${group.idGroup}`,
        );

        const updateContactData: FirebaseContactData = {
          ...contact,
          add: true,
        };
        await this.contactsService.updateContactData(updateContactData);
      }
    } catch (error) {
      console.error('Erro ao adicionar contatos no grupo', error.stack);
      throw new Error(`Erro ao adicionar contatos no grupo: ${error.message}`);
    }
  }
}
