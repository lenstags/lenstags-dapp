import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Tus configuraciones de Firebase aquí. Estos son ejemplos y deben ser reemplazados por tus configuraciones reales.
const firebaseConfig = {
  apiKey: 'AIzaSyBVbg1qaOkFgu3pySF8RbkAmNtyYzMWKo4',
  authDomain: 'nata-gram.firebaseapp.com',
  projectId: 'nata-gram',
  storageBucket: 'nata-gram.appspot.com',
  messagingSenderId: '627336891178'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
