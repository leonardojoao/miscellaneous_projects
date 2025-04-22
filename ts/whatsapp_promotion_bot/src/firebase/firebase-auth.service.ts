// firebase/firebase-auth.service.ts
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

@Injectable()
export class FirebaseAuthService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @Inject('FIREBASE_AUTH') private readonly auth: Auth,
  ) {}

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
    } catch (error: any) {
      if (error.code !== 'auth/email-already-in-use') {
        console.error('Erro ao criar:', error.code);
      } else {
        console.error('Usuário já cadastrado');
      }
      throw error;
    }
  }

  async attemptUserCreation(email: string, password: string): Promise<boolean> {
    try {
      await this.createUser(email, password);
      return true;
    } catch (error: any) {
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
}
