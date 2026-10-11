import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore'

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
const db = getFirestore(app)

const COLLECTIONS_TO_CLEAR = [
  'rawMaterials',
  'materialShipments',
  'villages',
  'artisans',
  'craftProducts',
  'craftShipments',
  'storeDispatches',
  'dispatches',
  'sales',
  'stockAdjustments',
  'storeInventory'
]

async function clearCollections() {
  console.log('--- Cleaning Firestore Dummy Data ---')
  for (const colName of COLLECTIONS_TO_CLEAR) {
    try {
      const colRef = collection(db, colName)
      const snapshot = await getDocs(colRef)
      if (snapshot.empty) {
        console.log(`[${colName}]: 0 documents (already clean)`)
        continue
      }

      const docs = snapshot.docs
      console.log(`[${colName}]: Deleting ${docs.length} documents...`)

      // Chunk in batches of 400
      for (let i = 0; i < docs.length; i += 400) {
        const chunk = docs.slice(i, i + 400)
        const batch = writeBatch(db)
        chunk.forEach(d => batch.delete(d.ref))
        await batch.commit()
      }
      console.log(`[${colName}]: Cleared successfully.`)
    } catch (err) {
      console.error(`[${colName}] Error:`, err.message)
    }
  }
  console.log('--- Done! All fake dummy data deleted from Firestore ---')
  process.exit(0)
}

clearCollections()
