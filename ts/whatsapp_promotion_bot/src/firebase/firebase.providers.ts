import { ConfigService } from '@nestjs/config';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

export const firebaseProviders = [
  {
    provide: 'FIREBASE_APP',
    useFactory: (configService: ConfigService): FirebaseApp => {
      const firebaseConfig = {
        apiKey: configService.get<string>('FIREBASE_API_KEY'),
        authDomain: configService.get<string>('FIREBASE_AUTH_DOMAIN'),
        databaseURL: configService.get<string>('FIREBASE_DATABASE_URL'),
        projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
        storageBucket: configService.get<string>('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: configService.get<string>(
          'FIREBASE_MESSAGING_SENDER_ID',
        ),
        appId: configService.get<string>('FIREBASE_APP_ID'),
        measurementId: configService.get<string>('FIREBASE_MEASUREMENT_ID'),
      };
      return initializeApp(firebaseConfig);
    },
    inject: [ConfigService],
  },
  {
    provide: 'FIREBASE_AUTH',
    useFactory: (app: FirebaseApp) => getAuth(app),
    inject: ['FIREBASE_APP'],
  },
  {
    provide: 'FIREBASE_DB',
    useFactory: (app: FirebaseApp) => getDatabase(app),
    inject: ['FIREBASE_APP'],
  },
];
