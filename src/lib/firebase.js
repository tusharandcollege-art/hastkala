import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyACB2ZuvzI1Tm08aIn4xax9kXZPKLKtS40",
  authDomain: "hastkala-8f7b4.firebaseapp.com",
  projectId: "hastkala-8f7b4",
  storageBucket: "hastkala-8f7b4.firebasestorage.app",
  messagingSenderId: "954652039726",
  appId: "1:954652039726:web:6606d2c0b0faebe9881dbf",
  measurementId: "G-17H8C6ZSJ5"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
