import { Inject, Injectable } from '@nestjs/common';
import { FirebaseContactData } from './interface/contacts.interface';
import {
  ref,
  push,
  set,
  get,
  Database,
  orderByChild,
  equalTo,
  query,
} from 'firebase/database';
import { FirebaseAuthService } from '../../firebase-auth.service';
import { Messages } from '../../messages.enum';

@Injectable()
export class ContactsService {
  tableName = 'contacts';

  constructor(
    @Inject('FIREBASE_DB') private readonly database: Database,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  async saveContactData(data: FirebaseContactData): Promise<void> {
    const { name, phone, category } = data;

    try {
      const dataRef = ref(this.database, this.tableName);
      const newDataRef = push(dataRef);

      await set(newDataRef, { name, phone, category, add: false });
      console.log(`${Messages.SAVE_SUCCESS} /${this.tableName}: ${phone}`);
    } catch (error) {
      console.log(
        `${Messages.SAVE_ERROR} /${this.tableName}: ${phone}`,
        error.stack,
      );
      throw new Error(`${Messages.SAVE_ERROR}: ${error.message}`);
    }
  }

  async getContactData(id: string): Promise<FirebaseContactData | null> {
    try {
      const dataRef = ref(this.database, `${this.tableName}/${id}`);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        return snapshot.val() as FirebaseContactData;
      } else {
        console.log(`${Messages.NOT_FOUND} /${this.tableName}: ${id}`);
        return null;
      }
    } catch (error) {
      console.log(
        `${Messages.FETCH_ERROR} /${this.tableName}: ${id}}`,
        error.stack,
      );
      console.error(
        `${Messages.FETCH_ERROR} /${this.tableName}: ${id}`,
        error.stack,
      );
      throw new Error(`${Messages.FETCH_ERROR}: ${error.message}`);
    }
  }

  async getByIdContactData(phone: string): Promise<FirebaseContactData | null> {
    try {
      const dataRef = ref(this.database, this.tableName);
      const groupQuery = query(dataRef, orderByChild('phone'), equalTo(phone));
      const snapshot = await get(groupQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const [id, value] = Object.entries(data)[0];

        return {
          id,
          ...(value as object),
        } as FirebaseContactData;
      } else {
        console.warn(`${Messages.NOT_FOUND} /${this.tableName}: ${phone}`);
        return null;
      }
    } catch (error) {
      console.error(
        `${Messages.FETCH_ERROR} /${this.tableName}: ${phone}`,
        error.stack,
      );
      throw new Error(`${Messages.FETCH_ERROR}: ${error.message}`);
    }
  }

  async getAllContactsData(): Promise<FirebaseContactData[]> {
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

  async updateContactData(data: FirebaseContactData): Promise<void> {
    const { id, name, phone, category, add } = data;
    try {
      const dataRef = ref(this.database, `${this.tableName}/${id}`);

      await set(dataRef, { name, phone, category, add });
      console.log(`${Messages.UPDATE_SUCCESS} /${this.tableName}: ${id}`);
    } catch (error) {
      console.log(
        `${Messages.UPDATE_ERROR} /${this.tableName}: ${id}`,
        error.stack,
      );
      throw new Error(`${Messages.UPDATE_ERROR}: ${error.message}`);
    }
  }
}
