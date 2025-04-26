import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseAdmin } from '../firestone.provider';

import { FirestoneLinkData } from './interface/links.interface';
import { Messages } from '../../messages.enum';

@Injectable()
export class LinksService {
  collectionName = 'links';
  constructor(
    @Inject(FirebaseAdmin) private readonly firebaseApp: admin.app.App,
  ) {}

  async saveLinkData(data: FirestoneLinkData): Promise<void> {
    try {
      await this.firebaseApp
        .firestore()
        .collection(this.collectionName)
        .add(data);
      console.log(
        `${Messages.SAVE_SUCCESS} /${this.collectionName}: ${data.link}`,
      );
    } catch (error) {
      console.log(
        `${Messages.SAVE_ERROR} /${this.collectionName}: ${data.link}`,
        error.stack,
      );
      throw new Error(`${Messages.SAVE_ERROR}: ${error.message}`);
    }
  }

  async getLinkData(id: string): Promise<FirestoneLinkData | null> {
    try {
      const dataRef = this.firebaseApp
        .firestore()
        .collection(this.collectionName)
        .doc(id);
      const snapshot = await dataRef.get();
      if (snapshot.exists) {
        return snapshot.data() as FirestoneLinkData;
      } else {
        console.warn(`${Messages.NOT_FOUND} /${this.collectionName}: ${id}`);
        return null;
      }
    } catch (error) {
      console.error(
        `${Messages.FETCH_ERROR} /${this.collectionName}: ${id}`,
        error.stack,
      );
      throw new Error(`${Messages.FETCH_ERROR}: ${error.message}`);
    }
  }

  async getAllLinksData(): Promise<FirestoneLinkData[]> {
    try {
      const dataRef = this.firebaseApp
        .firestore()
        .collection(this.collectionName);
      const snapshot = await dataRef.get();
      if (snapshot.empty) {
        console.warn(`${Messages.FETCH_ALL_ERROR} /${this.collectionName}`);
        return [];
      }
      return snapshot.docs.map((doc) => doc.data() as FirestoneLinkData);
    } catch (error) {
      console.error(
        `${Messages.FETCH_ALL_ERROR} /${this.collectionName}`,
        error.stack,
      );
      throw new Error(`${Messages.FETCH_ALL_ERROR}: ${error.message}`);
    }
  }

  async getLastThreeLowestByCategory(
    category: string,
  ): Promise<FirestoneLinkData[]> {
    try {
      const dataRef = this.firebaseApp
        .firestore()
        .collection(this.collectionName)
        .where('category', '==', category)
        .where('disabled', '==', false)
        .orderBy('count', 'asc')
        .limit(3);
      const snapshot = await dataRef.get();
      if (snapshot.empty) {
        console.warn(`${Messages.FETCH_ALL_ERROR} /${this.collectionName}`);
        return [];
      }
      return snapshot.docs.map((doc) => doc.data() as FirestoneLinkData);
    } catch (error) {
      console.error(
        `${Messages.FETCH_ALL_ERROR} /${this.collectionName}`,
        error.stack,
      );
      throw new Error(`${Messages.FETCH_ALL_ERROR}: ${error.message}`);
    }
  }

  async updateLinkData(data: FirestoneLinkData): Promise<void> {
    const { link, category } = data;
    try {
      const dataRef = this.firebaseApp
        .firestore()
        .collection(this.collectionName)
        .doc(link);
      await dataRef.update({ category });
      console.log(
        `${Messages.UPDATE_SUCCESS} /${this.collectionName}: ${link}`,
      );
    } catch (error) {
      console.error(
        `${Messages.UPDATE_ERROR} /${this.collectionName}: ${link}`,
        error.stack,
      );
      throw new Error(`${Messages.UPDATE_ERROR}: ${error.message}`);
    }
  }

  async deleteLinkData(id: string): Promise<void> {
    try {
      const dataRef = this.firebaseApp
        .firestore()
        .collection(this.collectionName)
        .doc(id);
      await dataRef.delete();
      console.log(`${Messages.DELETE_SUCCESS} /${this.collectionName}: ${id}`);
    } catch (error) {
      console.error(
        `${Messages.DELETE_ERROR} /${this.collectionName}: ${id}`,
        error.stack,
      );
      throw new Error(`${Messages.DELETE_ERROR}: ${error.message}`);
    }
  }
}
