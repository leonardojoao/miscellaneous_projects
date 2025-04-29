import { Inject, Injectable } from '@nestjs/common';
import { FirebaseGroupData } from './interface/groups.interface';
import {
  Database,
  equalTo,
  get,
  limitToLast,
  orderByChild,
  push,
  query,
  ref,
  set,
} from 'firebase/database';
import { FirebaseAuthService } from '../../firebase-auth.service';
import { Messages } from '../../messages.enum';

@Injectable()
export class GroupsService {
  tableName = 'groups';

  constructor(
    @Inject('FIREBASE_DB') private readonly database: Database,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  async saveGroupData(data: FirebaseGroupData): Promise<void> {
    const { name, idGroup, category } = data;

    try {
      const dataRef = ref(this.database, this.tableName);
      const newDataRef = push(dataRef);

      await set(newDataRef, { name, idGroup, category, addContacts: true });
      console.log(`${Messages.SAVE_SUCCESS} /${this.tableName}: ${idGroup}`);
    } catch (error) {
      console.error(
        `${Messages.SAVE_ERROR} /${this.tableName}: ${idGroup}`,
        error.stack,
      );
      throw new Error(`${Messages.SAVE_ERROR}: ${error.message}`);
    }
  }

  async getByIdGroupData(idGroup: string): Promise<FirebaseGroupData | null> {
    try {
      const dataRef = ref(this.database, this.tableName);
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
        console.warn(`${Messages.NOT_FOUND} /${this.tableName}: ${idGroup}`);
        return null;
      }
    } catch (error) {
      console.log(
        `${Messages.FETCH_ERROR} /${this.tableName}: ${idGroup}`,
        error.stack,
      );
      throw new Error(`${Messages.FETCH_ERROR}: ${error.message}`);
    }
  }

  async getAllGroupsData(): Promise<FirebaseGroupData[]> {
    try {
      const dataRef = ref(this.database, this.tableName);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
      } else {
        console.warn(`${Messages.FETCH_ALL_ERROR} /${this.tableName}`);
        return [];
      }
    } catch (error) {
      console.error(
        `${Messages.FETCH_ALL_ERROR} /${this.tableName}`,
        error.stack,
      );
      throw new Error(`${Messages.FETCH_ALL_ERROR}: ${error.message}`);
    }
  }

  async getAllActiveGroupsData(): Promise<FirebaseGroupData[]> {
    try {
      const dataRef = ref(this.database, this.tableName);

      const activeGroupsQuery = query(
        dataRef,
        orderByChild('addContacts'),
        equalTo(true),
      );
      const snapshot = await get(activeGroupsQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
      } else {
        console.warn(`${Messages.FETCH_ALL_ERROR} /${this.tableName}`);
        return [];
      }
    } catch (error) {
      console.error(
        `${Messages.FETCH_ALL_ERROR} /${this.tableName}`,
        error.stack,
      );
      throw new Error(`${Messages.FETCH_ALL_ERROR}: ${error.message}`);
    }
  }

  async getAllAddContactsGroupsData(): Promise<FirebaseGroupData[]> {
    try {
      const dataRef = ref(this.database, this.tableName);

      const activeGroupsQuery = query(
        dataRef,
        orderByChild('addContacts'),
        equalTo(true),
      );
      const snapshot = await get(activeGroupsQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
      } else {
        console.warn(`${Messages.FETCH_ALL_ERROR} /${this.tableName}`);
        return [];
      }
    } catch (error) {
      console.error(
        `${Messages.FETCH_ALL_ERROR} /${this.tableName}`,
        error.stack,
      );
      throw new Error(`${Messages.FETCH_ALL_ERROR}: ${error.message}`);
    }
  }

  async getLast30AddContactsGroups(): Promise<FirebaseGroupData[]> {
    try {
      const dataRef = ref(this.database, this.tableName);

      const activeGroupsQuery = query(
        dataRef,
        orderByChild('addContacts'),
        equalTo(true),
        limitToLast(30),
      );

      const snapshot = await get(activeGroupsQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
      } else {
        console.warn(`${Messages.FETCH_ALL_ERROR} /${this.tableName}`);
        return [];
      }
    } catch (error) {
      console.error(
        `${Messages.FETCH_ALL_ERROR} /${this.tableName}`,
        error.stack,
      );
      throw new Error(`${Messages.FETCH_ALL_ERROR}: ${error.message}`);
    }
  }
}
