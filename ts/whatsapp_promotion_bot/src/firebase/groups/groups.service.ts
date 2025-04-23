import { Inject, Injectable } from '@nestjs/common';
import { FirebaseGroupData } from './interface/groups.interface';
import {
  Database,
  equalTo,
  get,
  orderByChild,
  push,
  query,
  ref,
  set,
} from 'firebase/database';
import { FirebaseAuthService } from '../firebase-auth.service';

@Injectable()
export class GroupsService {
  constructor(
    @Inject('FIREBASE_DB') private readonly database: Database,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  async saveGroupData(data: FirebaseGroupData): Promise<void> {
    const { name, idGroup, category } = data;

    try {
      const dataRef = ref(this.database, 'groups');
      const newDataRef = push(dataRef);

      await set(newDataRef, { name, idGroup, category, addContacts: true });

      console.log(`Dados salvos com sucesso /groups: ${idGroup}`);
    } catch (error) {
      console.error(`Erro ao salvar dados /groups: ${idGroup}`, error.stack);
      throw new Error(`Falha ao salvar dados /groups: ${error.message}`);
    }
  }

  async getByIdGroupData(idGroup: string): Promise<FirebaseGroupData | null> {
    try {
      const dataRef = ref(this.database, 'groups');
      const groupQuery = query(
        dataRef,
        orderByChild('idGroup'),
        equalTo(idGroup),
      );
      const snapshot = await get(groupQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const [id, value] = Object.entries(data)[0];

        return {
          id,
          ...(value as object),
        } as FirebaseGroupData;
      } else {
        console.warn(`Nenhum dado encontrado para o ID: ${idGroup}`);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar dados por id /groups', error.stack);
      throw new Error(`Falha ao buscar dados por id /groups: ${error.message}`);
    }
  }

  async getAllGroupsData(): Promise<FirebaseGroupData[]> {
    try {
      const dataRef = ref(this.database, 'groups');
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
      } else {
        console.warn('Nenhum dado encontrado na base de dados /groups.');
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar dados de /groups', error.stack);
      throw new Error(`Falha ao buscar dados /groups: ${error.message}`);
    }
  }
}
