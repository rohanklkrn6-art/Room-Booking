import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDVSPiFHhDaYHbP5rhEhZAdoSFDOL6ZLDM',
  authDomain: 'smart-timetable-thro.firebaseapp.com',
  projectId: 'smart-timetable-thro',
  storageBucket: 'smart-timetable-thro.firebasestorage.app',
  messagingSenderId: '250677976457',
  appId: '1:250677976457:web:bce8f7dbca33de11d39558',
  measurementId: 'G-J1FV8B9P90',
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const db = getFirestore(app);
