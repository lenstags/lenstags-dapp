import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

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
