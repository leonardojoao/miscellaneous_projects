import { Inject, Injectable } from '@nestjs/common';
import { ref, push, set, get, Database } from 'firebase/database';

import { FirebaseAuthService } from '../firebase-auth.service';
import { FirebaseContactData } from './interface/contacts.interface';

@Injectable()
export class ContactsService {
  constructor(
    @Inject('FIREBASE_DB') private readonly database: Database,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  async saveContactData(data: FirebaseContactData): Promise<void> {
    const { name, phone, add } = data;

    try {
      const dataRef = ref(this.database, 'contacts');
      const newDataRef = push(dataRef);

      await set(newDataRef, { name, phone, add });

      console.log(`Dados salvos com sucesso para o contato: ${phone}`);
    } catch (error) {
      console.error(
        `Erro ao salvar dados para o contato /contacts: ${phone}`,
        error.stack,
      );
      throw new Error(`Falha ao salvar dados /contacts: ${error.message}`);
    }
  }

  async getContact(id: string): Promise<FirebaseContactData | null> {
    try {
      const dataRef = ref(this.database, `links/${id}`);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        return snapshot.val() as FirebaseContactData;
      } else {
        console.warn(`Nenhum dado encontrado para o ID /contacts: ${id}`);
        return null;
      }
    } catch (error) {
      console.error(
        `Erro ao buscar dados para o ID /contacts: ${id}`,
        error.stack,
      );
      throw new Error(`Falha ao buscar dados /contacts: ${error.message}`);
    }
  }

  async getAllContacts(): Promise<FirebaseContactData[]> {
    try {
      const dataRef = ref(this.database, 'contacts');
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
      } else {
        console.warn('Nenhum dado encontrado na base de dados /contacts.');
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar dados de /contacts', error.stack);
      throw new Error(`Falha ao buscar dados /contacts: ${error.message}`);
    }
  }

  async updateLinkData(data: FirebaseContactData): Promise<void> {
    const { id, name, phone, add } = data;
    try {
      const dataRef = ref(this.database, `contacts/${id}`);
      await set(dataRef, { name, phone, add });

      console.log(`Dados atualizados com sucesso para ID /contacts: ${id}`);
    } catch (error) {
      console.error(
        `Erro ao atualizar dados para ID /contacts: ${id}`,
        error.stack,
      );
      throw new Error(`Falha ao atualizar dados /contacts: ${error.message}`);
    }
  }
}
