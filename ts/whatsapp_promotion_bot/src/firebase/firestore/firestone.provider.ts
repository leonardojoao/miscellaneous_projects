import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

import * as serviceAccount from './credentials.json';

export const FirebaseAdmin = 'FIREBASE_ADMIN';

export const firestoneProvider: Provider = {
  provide: FirebaseAdmin,
  useFactory: () => {
    if (admin.apps.length === 0) {
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as ServiceAccount),
        // opcional: databaseURL se estiver usando o Realtime Database
        // databaseURL: "https://<your-project-id>.firebaseio.com"
      });
    }
    return admin.app(); // se já estiver inicializado
  },
};
