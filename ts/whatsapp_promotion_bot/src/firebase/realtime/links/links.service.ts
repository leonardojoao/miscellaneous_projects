import { Inject, Injectable } from '@nestjs/common';
import { ref, push, set, get, Database } from 'firebase/database';

import { FirebaseAuthService } from '../../firebase-auth.service';
import { FirebaseLinkData } from './interface/links.interface';
import { Messages } from '../../messages.enum';

@Injectable()
export class LinksService {
  tableName = 'links';
  constructor(
    @Inject('FIREBASE_DB') private readonly database: Database,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  async saveLinkData(data: FirebaseLinkData): Promise<void> {
    const { link, count, statusError } = data;

    try {
      const dataRef = ref(this.database, this.tableName);
      const newDataRef = push(dataRef);

      await set(newDataRef, { link, count, statusError });
      console.log(`${Messages.SAVE_SUCCESS} /${this.tableName}: ${link}`);
    } catch (error) {
      console.log(
        `${Messages.SAVE_ERROR} /${this.tableName}: ${link}`,
        error.stack,
      );
      throw new Error(`${Messages.SAVE_ERROR}: ${error.message}`);
    }
  }

  async getLinkData(id: string): Promise<FirebaseLinkData | null> {
    try {
      const dataRef = ref(this.database, `${this.tableName}/${id}`);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        return snapshot.val() as FirebaseLinkData;
      } else {
        console.warn(`${Messages.NOT_FOUND} /${this.tableName}: ${id}`);
        return null;
      }
    } catch (error) {
      console.error(
        `${Messages.FETCH_ERROR} /${this.tableName}: ${id}`,
        error.stack,
      );
      throw new Error(`${Messages.FETCH_ERROR}: ${error.message}`);
    }
  }

  async getAllLinksData(): Promise<FirebaseLinkData[]> {
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

  async updateLinkData(data: FirebaseLinkData): Promise<void> {
    const { id, link, count, statusError } = data;
    try {
      const dataRef = ref(this.database, `${this.tableName}/${id}`);
      await set(dataRef, { link, count, statusError });

      console.log(`${Messages.UPDATE_SUCCESS} /${this.tableName}: ${id}`);
    } catch (error) {
      console.error(`${Messages.UPDATE_ERROR} /${this.tableName}: ${id}`);
      throw new Error(`${Messages.UPDATE_ERROR}: ${error.message}`);
    }
  }
}
