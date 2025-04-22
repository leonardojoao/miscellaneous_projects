import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { getDatabase, ref, push, set, get } from 'firebase/database';
import { FirebaseContactData } from './interface/contacts.interface';

@Injectable()
export class ContactsService implements OnModuleInit {
  private firebaseConfig = {
    apiKey: this.configService.get('FIREBASE_API_KEY'),
    authDomain: this.configService.get('FIREBASE_AUTH_DOMAIN'),
    databaseURL: this.configService.get('FIREBASE_DATABASE_URL'),
    projectId: this.configService.get('FIREBASE_PROJECT_ID'),
    storageBucket: this.configService.get('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: this.configService.get('FIREBASE_MESSAGING_SENDER_ID'),
    appId: this.configService.get('FIREBASE_APP_ID'),
    measurementId: this.configService.get('FIREBASE_MEASUREMENT_ID'),
  };

  private app = initializeApp(this.firebaseConfig);
  private database = getDatabase(this.app);
  private auth = getAuth(this.app);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const email = this.configService.get<string>('FIREBASE_TEST_EMAIL');
    const password = this.configService.get<string>('FIREBASE_TEST_PASSWORD');

    if (!email || !password) {
      console.error(
        'FIREBASE_TEST_EMAIL ou FIREBASE_TEST_PASSWORD não configurados.',
      );
      return;
    }

    try {
      const hasUser = await this.attemptUserCreation(email, password);

      if (hasUser) {
        await this.loginUser(email, password);
        console.log(`Login realizado com sucesso: ${email}`);
      }
    } catch (error) {
      console.error(`Erro ao logar com ${email}:`, error);
    }
  }

  async createUser(email: string, password: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      console.log('Usuário criado:', userCredential.user.uid);
    } catch (error) {
      if (error.code !== 'auth/email-already-in-use') {
        console.error('Erro ao criar:', error.code);
      } else {
        console.error('Usuário ja cadastrado');
      }
      throw error;
    }
  }

  async attemptUserCreation(email: string, password: string): Promise<boolean> {
    try {
      await this.createUser(email, password);
      return true;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.error('Usuário já existe, tentando login...');
        return true;
      }
      return false;
    }
  }

  async loginUser(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      console.log('Logado como:', userCredential.user.uid);
    } catch (error) {
      console.error('Erro de login:', error);
      throw error;
    }
  }

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
