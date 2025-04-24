import { Inject, Injectable } from '@nestjs/common';
import { ref, push, set, get, Database } from 'firebase/database';

import { FirebaseAuthService } from '../firebase-auth.service';
import { FirebaseLinkData } from './interface/links.interface';

@Injectable()
export class LinksService {
  constructor(
    @Inject('FIREBASE_DB') private readonly database: Database,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  async saveLinkData(data: FirebaseLinkData): Promise<void> {
    const { link, count, statusError } = data;

    try {
      const dataRef = ref(this.database, 'links');
      const newDataRef = push(dataRef);

      await set(newDataRef, { link, count, statusError });

      console.log(`Dados salvos com sucesso para o link: ${link}`);
    } catch (error) {
      console.error(`Erro ao salvar dados para o link: ${link}`, error.stack);
      throw new Error(`Falha ao salvar dados: ${error.message}`);
    }
  }

  async getLink(id: string): Promise<FirebaseLinkData | null> {
    try {
      const dataRef = ref(this.database, `links/${id}`);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        return snapshot.val() as FirebaseLinkData;
      } else {
        console.warn(`Nenhum dado encontrado para o ID: ${id}`);
        return null;
      }
    } catch (error) {
      console.error(`Erro ao buscar dados para o ID: ${id}`, error.stack);
      throw new Error(`Falha ao buscar dados: ${error.message}`);
    }
  }

  async getAllLinks(): Promise<FirebaseLinkData[]> {
    try {
      const dataRef = ref(this.database, 'links');
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
      } else {
        console.warn('Nenhum dado encontrado na base de dados /links.');
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar dados de /links', error.stack);
      throw new Error(`Falha ao buscar dados: ${error.message}`);
    }
  }

  async updateLinkData(data: FirebaseLinkData): Promise<void> {
    const { id, link, count, statusError } = data;
    try {
      const dataRef = ref(this.database, `links/${id}`);
      await set(dataRef, { link, count, statusError });

      console.log(`Dados atualizados com sucesso para ID: ${id}`);
    } catch (error) {
      console.error(`Erro ao atualizar dados para ID: ${id}`, error.stack);
      throw new Error(`Falha ao atualizar dados: ${error.message}`);
    }
  }
}
