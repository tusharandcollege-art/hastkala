/**
 * Hastkala — Persistence Layer
 * Primary store: Firestore (real-time, multi-device)
 * Cache: localStorage (instant UI, offline fallback)
 *
 * Strategy:
 *  - All writes go to localStorage first (synchronous → instant UI update)
 *  - Then the same write is mirrored to Firestore async (no blocking)
 *  - On app load, Firestore onSnapshot listeners hydrate Zustand with live data
 */

import { v4 as uuidv4 } from 'uuid'
import { fsSetDoc, fsDeleteDoc, fsSetCollection } from './firestoreDb'

// ─── localStorage helpers ────────────────────────────────────────────────────

const PREFIX = 'hastkala_'

function read(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage write error', e)
  }
}

// ─── Generic CRUD (localStorage + Firestore mirror) ──────────────────────────

export function getCollection(name) {
  const val = read(name)
  return Array.isArray(val) ? val : []
}

export function getDoc(name, id) {
  const col = getCollection(name)
  return col.find(d => d && d.id === id) || null
}

export function addDoc(name, data) {
  const col = [...getCollection(name)]
  const document = { ...data, id: uuidv4(), createdAt: new Date().toISOString() }
  col.push(document)
  write(name, col)
  // Mirror to Firestore (async, non-blocking)
  fsSetDoc(name, document)
  return document
}

export function updateDoc(name, id, data) {
  const col = [...getCollection(name)]
  const idx = col.findIndex(d => d && d.id === id)
  if (idx === -1) return null
  col[idx] = { ...col[idx], ...data, updatedAt: new Date().toISOString() }
  write(name, col)
  // Mirror to Firestore (async, non-blocking)
  fsSetDoc(name, col[idx])
  return col[idx]
}

export function deleteDoc(name, id) {
  const col = getCollection(name)
  const filtered = col.filter(d => d && d.id !== id)
  write(name, filtered)
  // Mirror to Firestore
  return fsDeleteDoc(name, id)
}

export function setCollection(name, arr) {
  write(name, Array.isArray(arr) ? arr : [])
  // Mirror to Firestore (async, non-blocking)
  fsSetCollection(name, Array.isArray(arr) ? arr : [])
}

// ─── Seed Schema Only (No Fake Dummy Records) ────────────────────────────────

export function seedDemoData() {
  try {
    const existingSchema = read('artisanFormSchema')
    if (Array.isArray(existingSchema) && existingSchema.length > 0) return

    // Default artisan registration form schema
    const schema = [
      { id: uuidv4(), label: 'First Name', fieldKey: 'firstName', type: 'text', required: true, order: 0 },
      { id: uuidv4(), label: 'Age', fieldKey: 'age', type: 'number', required: false, order: 1 },
      { id: uuidv4(), label: 'Marital Status', fieldKey: 'maritalStatus', type: 'select', required: true, options: ['Married', 'Unmarried / Single', 'Widowed', 'Divorced / Separated'], order: 2 },
      { id: uuidv4(), label: 'Caste', fieldKey: 'caste', type: 'select', required: false, options: ['General', 'OBC', 'SC', 'ST', 'Other'], order: 3 },
      { id: uuidv4(), label: 'Aadhaar Number', fieldKey: 'aadhaarNumber', type: 'text', required: false, order: 4 },
      { id: uuidv4(), label: 'Education', fieldKey: 'education', type: 'select', required: false, options: ['No Formal Education', 'Primary (5th Pass)', 'Middle (8th Pass)', 'High School (10th Pass)', 'Intermediate (12th Pass)', 'Graduate', 'Other'], order: 5 },
      { id: uuidv4(), label: 'Relative Works in Trident?', fieldKey: 'tridentRelative', type: 'select', required: true, options: ['No', 'Yes - Factory / Plant', 'Yes - Office / Staff', 'Yes - Other'], order: 6 },
      { id: uuidv4(), label: 'Trident Relative Details', fieldKey: 'tridentRelativeDetails', type: 'text', required: false, order: 7 },
      { id: uuidv4(), label: 'Phone Number', fieldKey: 'phone', type: 'text', required: false, order: 8 },
      { id: uuidv4(), label: 'Primary Craft Skill', fieldKey: 'craftSkill', type: 'select', required: true, options: ['Weaving','Embroidery','Pottery','Basket Weaving','Block Printing','Jewellery Making','Other'], order: 9 },
      { id: uuidv4(), label: 'Photo', fieldKey: 'photo', type: 'photo', required: false, order: 10 },
    ]
    write('artisanFormSchema', schema)
    fsSetCollection('artisanFormSchema', schema)
    write('__seeded__', true)
  } catch (err) {
    console.error('seedDemoData failed:', err)
  }
}
