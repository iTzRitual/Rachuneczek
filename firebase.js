import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyAiPX-ODZFsymdjj7GKe4OX6ZMDI2JaLQI',
  authDomain: 'my-finance-1786e.firebaseapp.com',
  projectId: 'https://my-finance-1786e-default-rtdb.europe-west1.firebasedatabase.app',
  storageBucket: 'my-finance-1786e.appspot.com',
  messagingSenderId: '405884372339',
  appId: '1:405884372339:web:c479e0638b0c4d030df106',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
