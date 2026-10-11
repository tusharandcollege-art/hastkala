/**
 * Hastkala — Firestore CRUD helpers & Realtime Sync
 * Each "collection" in the app maps 1-to-1 with a Firestore collection.
 * Each document uses its existing `id` field as the Firestore document ID.
 */

import { db } from './firebase'
import {
  collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch
} from 'firebase/firestore'

// Sanitize objects to prevent Firestore errors on `undefined` values
function sanitizeForFirestore(obj) {
  if (obj === null || obj === undefined) return null
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore)
  }
  if (typeof obj === 'object') {
    const cleaned = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value)
      }
    }
    return cleaned
  }
  return obj
}

// Write / upsert a single document
export async function fsSetDoc(collectionName, docData) {
  try {
    if (!docData || !docData.id) return
    const ref = doc(db, collectionName, String(docData.id))
    await setDoc(ref, sanitizeForFirestore(docData), { merge: true })
  } catch (e) {
    console.error(`[Firestore] setDoc error in ${collectionName}:`, e)
  }
}

// Delete a single document by ID
export async function fsDeleteDoc(collectionName, id) {
  try {
    if (!id) return
    const ref = doc(db, collectionName, String(id))
    await deleteDoc(ref)
  } catch (e) {
    console.error(`[Firestore] deleteDoc error in ${collectionName}:`, e)
  }
}

// Overwrite an entire collection using batch writes (chunked into 400 docs max)
export async function fsSetCollection(collectionName, items) {
  try {
    if (!Array.isArray(items) || items.length === 0) return
    const chunkSize = 400
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize)
      const batch = writeBatch(db)
      chunk.forEach(item => {
        if (item && item.id) {
          const ref = doc(db, collectionName, String(item.id))
          batch.set(ref, sanitizeForFirestore(item), { merge: true })
        }
      })
      await batch.commit()
    }
  } catch (e) {
    console.error(`[Firestore] setCollection error in ${collectionName}:`, e)
  }
}

// Subscribe to a Firestore collection with real-time updates
export function fsSubscribe(collectionName, callback) {
  try {
    const colRef = collection(db, collectionName)
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id }))
        callback(items)
      },
      (error) => {
        console.warn(`[Firestore] onSnapshot notice in ${collectionName}:`, error.message)
      }
    )
  } catch (err) {
    console.warn(`[Firestore] fsSubscribe failed for ${collectionName}:`, err.message)
    return () => {}
  }
}

// Collections to sync with Firestore
export const SYNC_COLLECTIONS = [
  'rawMaterials',
  'materialShipments',
  'villages',
  'artisans',
  'artisanFormSchema',
  'craftProducts',
  'craftShipments',
  'storeDispatches',
  'dispatches',
  'sales',
  'stockAdjustments'
]

// Initialize bi-directional realtime sync with Zustand store
export function initFirestoreSync(useStoreApi, recomputeInventory) {
  SYNC_COLLECTIONS.forEach(colName => {
    let hasLoadedRemote = false

    fsSubscribe(colName, (items) => {
      if (items.length > 0) {
        // Remote has data -> update localStorage and Zustand store
        try {
          localStorage.setItem('hastkala_' + colName, JSON.stringify(items))
        } catch (_) {}

        useStoreApi.setState({ [colName]: items })

        if (['craftProducts', 'storeDispatches', 'sales', 'stockAdjustments'].includes(colName)) {
          const state = useStoreApi.getState()
          const inv = recomputeInventory(
            state.craftProducts,
            state.storeDispatches,
            state.sales,
            state.stockAdjustments
          )
          try {
            localStorage.setItem('hastkala_storeInventory', JSON.stringify(inv))
          } catch (_) {}
          useStoreApi.setState({ storeInventory: inv })
        }
      } else if (!hasLoadedRemote) {
        // First snapshot and Firestore collection is empty:
        // Push initial local cache to Firestore so database is populated!
        const localData = useStoreApi.getState()[colName]
        if (Array.isArray(localData) && localData.length > 0) {
          fsSetCollection(colName, localData)
        }
      }
      hasLoadedRemote = true
    })
  })
}
