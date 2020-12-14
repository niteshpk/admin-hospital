import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyC2DJwJLUeqvDvIJgvD8ODU0SaUIM98mOc',
  authDomain: 'admin-hospital.firebaseapp.com',
  projectId: 'admin-hospital',
  storageBucket: 'admin-hospital.appspot.com',
  messagingSenderId: '354037243294',
  appId: '1:354037243294:web:f1f26e06080f3ee95f0a8f',
  measurementId: 'G-5HENNGXHMQ',
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();

export { auth, provider };
export { serverTimestamp };
export default db;
