/**
 * Hastkala — Persistence Layer
 * Uses localStorage as primary store.
 * Firebase can be wired in later by setting VITE_USE_FIREBASE=true in .env
 *
 * Collections: rawMaterials, villages, artisans, artisanFormSchema,
 *              craftProducts, dispatches, yieldLogs, storeInventory, sales
 */

import { v4 as uuidv4 } from 'uuid'

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

// ─── Generic CRUD ────────────────────────────────────────────────────────────

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
  const doc = { ...data, id: uuidv4(), createdAt: new Date().toISOString() }
  col.push(doc)
  write(name, col)
  return doc
}

export function updateDoc(name, id, data) {
  const col = [...getCollection(name)]
  const idx = col.findIndex(d => d && d.id === id)
  if (idx === -1) return null
  col[idx] = { ...col[idx], ...data, updatedAt: new Date().toISOString() }
  write(name, col)
  return col[idx]
}

export function deleteDoc(name, id) {
  const col = getCollection(name)
  const filtered = col.filter(d => d && d.id !== id)
  write(name, filtered)
}

export function setCollection(name, arr) {
  write(name, Array.isArray(arr) ? arr : [])
}

// ─── Seed Demo Data ───────────────────────────────────────────────────────────

export function seedDemoData() {
  try {
    if (read('__seeded__')) return

  // Default artisan form schema
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

  // Villages
  const villages = [
    { id: uuidv4(), name: 'Rampur', district: 'Barabanki', state: 'Uttar Pradesh', contactPerson: 'Sarpanch Ram Singh', phone: '9876543210', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Chandpur', district: 'Lucknow', state: 'Uttar Pradesh', contactPerson: 'Sarpanch Leela Devi', phone: '9876543211', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Sonpur', district: 'Saran', state: 'Bihar', contactPerson: 'Sarpanch Mohan Lal', phone: '9876543212', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Madhopur', district: 'Sitapur', state: 'Uttar Pradesh', contactPerson: 'Sarpanch Sunita Sharma', phone: '9876543213', createdAt: new Date().toISOString() },
  ]
  write('villages', villages)

  // Raw materials
  const mats = [
    { id: uuidv4(), name: 'Jute Fabric', unit: 'meters', quantity: 500, unitCost: 45, receivedDate: '2026-09-01', notes: 'Premium grade jute', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Cotton Thread', unit: 'kg', quantity: 120, unitCost: 320, receivedDate: '2026-09-05', notes: 'Multi-color assorted', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Terracotta Clay', unit: 'kg', quantity: 800, unitCost: 18, receivedDate: '2026-09-10', notes: 'Red clay, sieved', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Silk Yarn', unit: 'kg', quantity: 60, unitCost: 1200, receivedDate: '2026-09-15', notes: 'Natural silk, undyed', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Natural Dyes', unit: 'kg', quantity: 40, unitCost: 250, receivedDate: '2026-09-18', notes: 'Indigo, turmeric, madder', createdAt: new Date().toISOString() },
  ]
  write('rawMaterials', mats)

  // Craft products
  const crafts = [
    { id: uuidv4(), name: 'Handwoven Jute Tote Bag', category: 'Bags & Accessories', costPrice: 180, sellingPrice: 450, unit: 'piece', description: 'Eco-friendly hand-woven jute bag', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Chikan Embroidered Dupatta', category: 'Textiles', costPrice: 450, sellingPrice: 1200, unit: 'piece', description: 'Lucknowi chikan embroidery on cotton', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Terracotta Vase', category: 'Pottery', costPrice: 120, sellingPrice: 350, unit: 'piece', description: 'Hand-painted terracotta vase', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Silk Saree', category: 'Textiles', costPrice: 2800, sellingPrice: 6500, unit: 'piece', description: 'Handloom pure silk saree', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Bamboo Basket', category: 'Home Decor', costPrice: 85, sellingPrice: 220, unit: 'piece', description: 'Hand-woven bamboo storage basket', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Block Print Cushion Cover', category: 'Home Decor', costPrice: 95, sellingPrice: 280, unit: 'piece', description: 'Hand block-printed cotton cushion cover', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Clay Diya Set (12 pcs)', category: 'Pottery', costPrice: 60, sellingPrice: 180, unit: 'set', description: 'Hand-painted clay diyas', createdAt: new Date().toISOString() },
  ]
  write('craftProducts', crafts)

  // Artisans
  const artisans = [
    { id: uuidv4(), villageId: villages[0].id, dynamicFields: { firstName: 'Savitri Devi', fullName: 'Savitri Devi', age: 34, maritalStatus: 'Married', caste: 'OBC', aadhaarNumber: '1234-5678-9012', education: 'High School (10th Pass)', tridentRelative: 'Yes - Factory / Plant', tridentRelativeDetails: 'Brother-in-law Ramesh in Weaving Dept', phone: '9811111111', craftSkill: 'Weaving' }, isActive: true, createdAt: new Date().toISOString() },
    { id: uuidv4(), villageId: villages[0].id, dynamicFields: { firstName: 'Kamla Prasad', fullName: 'Kamla Prasad', age: 42, maritalStatus: 'Married', caste: 'SC', aadhaarNumber: '2345-6789-0123', education: 'Middle (8th Pass)', tridentRelative: 'No', phone: '9822222222', craftSkill: 'Embroidery' }, isActive: true, createdAt: new Date().toISOString() },
    { id: uuidv4(), villageId: villages[1].id, dynamicFields: { firstName: 'Pushpa Rani', fullName: 'Pushpa Rani', age: 29, maritalStatus: 'Married', caste: 'OBC', aadhaarNumber: '3456-7890-1234', education: 'Intermediate (12th Pass)', tridentRelative: 'Yes - Office / Staff', tridentRelativeDetails: 'Cousin Sunita in Admin', phone: '9833333333', craftSkill: 'Pottery' }, isActive: true, createdAt: new Date().toISOString() },
    { id: uuidv4(), villageId: villages[1].id, dynamicFields: { firstName: 'Mala Kumari', fullName: 'Mala Kumari', age: 24, maritalStatus: 'Unmarried / Single', caste: 'General', aadhaarNumber: '4567-8901-2345', education: 'Graduate', tridentRelative: 'No', phone: '9844444444', craftSkill: 'Weaving' }, isActive: true, createdAt: new Date().toISOString() },
    { id: uuidv4(), villageId: villages[2].id, dynamicFields: { firstName: 'Geeta Devi', fullName: 'Geeta Devi', age: 48, maritalStatus: 'Widowed', caste: 'ST', aadhaarNumber: '5678-9012-3456', education: 'Primary (5th Pass)', tridentRelative: 'No', phone: '9855555555', craftSkill: 'Basket Weaving' }, isActive: true, createdAt: new Date().toISOString() },
    { id: uuidv4(), villageId: villages[3].id, dynamicFields: { firstName: 'Sunita Yadav', fullName: 'Sunita Yadav', age: 36, maritalStatus: 'Married', caste: 'OBC', aadhaarNumber: '6789-0123-4567', education: 'High School (10th Pass)', tridentRelative: 'No', phone: '9866666666', craftSkill: 'Block Printing' }, isActive: true, createdAt: new Date().toISOString() },
  ]
  write('artisans', artisans)

  // Dispatches
  const dispatches = [
    { id: uuidv4(), rawMaterialId: mats[0].id, villageId: villages[0].id, artisanId: artisans[0].id, quantityDispatched: 80, date: '2026-09-12', notes: 'For tote bag production', createdAt: new Date().toISOString() },
    { id: uuidv4(), rawMaterialId: mats[1].id, villageId: villages[1].id, artisanId: null, quantityDispatched: 30, date: '2026-09-14', notes: 'Chikan embroidery batch', createdAt: new Date().toISOString() },
    { id: uuidv4(), rawMaterialId: mats[2].id, villageId: villages[2].id, artisanId: artisans[4].id, quantityDispatched: 200, date: '2026-09-16', notes: 'Pottery batch', createdAt: new Date().toISOString() },
    { id: uuidv4(), rawMaterialId: mats[3].id, villageId: villages[3].id, artisanId: null, quantityDispatched: 20, date: '2026-09-20', notes: 'Silk saree weaving', createdAt: new Date().toISOString() },
  ]
  write('dispatches', dispatches)

  // Craft shipments (Inward batches to Craft Catalog)
  const craftShipments = [
    { id: uuidv4(), craftProductId: crafts[0].id, quantity: 50, costPrice: crafts[0].costPrice, date: '2026-09-20', notes: 'Initial intake batch', createdAt: new Date().toISOString() },
    { id: uuidv4(), craftProductId: crafts[1].id, quantity: 30, costPrice: crafts[1].costPrice, date: '2026-09-22', notes: 'Lucknow cluster batch', createdAt: new Date().toISOString() },
    { id: uuidv4(), craftProductId: crafts[2].id, quantity: 80, costPrice: crafts[2].costPrice, date: '2026-09-25', notes: 'Pottery cluster batch', createdAt: new Date().toISOString() },
    { id: uuidv4(), craftProductId: crafts[3].id, quantity: 15, costPrice: crafts[3].costPrice, date: '2026-09-28', notes: 'Silk handloom batch', createdAt: new Date().toISOString() },
    { id: uuidv4(), craftProductId: crafts[4].id, quantity: 45, costPrice: crafts[4].costPrice, date: '2026-09-29', notes: 'Bamboo craft intake', createdAt: new Date().toISOString() },
    { id: uuidv4(), craftProductId: crafts[5].id, quantity: 40, costPrice: crafts[5].costPrice, date: '2026-09-30', notes: 'Block print batch', createdAt: new Date().toISOString() },
    { id: uuidv4(), craftProductId: crafts[6].id, quantity: 100, costPrice: crafts[6].costPrice, date: '2026-10-01', notes: 'Diwali diya collection', createdAt: new Date().toISOString() },
  ]
  write('craftShipments', craftShipments)

  // Store dispatches ("Send to Store" from Craft Catalog)
  const storeDispatches = [
    { id: uuidv4(), craftProductId: crafts[0].id, quantity: 30, date: '2026-10-02', notes: 'Sent to retail counter for display', createdAt: new Date().toISOString() },
    { id: uuidv4(), craftProductId: crafts[1].id, quantity: 15, date: '2026-10-03', notes: 'Sent to store counter', createdAt: new Date().toISOString() },
    { id: uuidv4(), craftProductId: crafts[2].id, quantity: 50, date: '2026-10-03', notes: 'Sent to store counter', createdAt: new Date().toISOString() },
    { id: uuidv4(), craftProductId: crafts[3].id, quantity: 8, date: '2026-10-04', notes: 'Sent to high-value rack', createdAt: new Date().toISOString() },
    { id: uuidv4(), craftProductId: crafts[6].id, quantity: 60, date: '2026-10-04', notes: 'Festive display stock', createdAt: new Date().toISOString() },
  ]
  write('storeDispatches', storeDispatches)

  // Sales records
  const sales = [
    {
      id: uuidv4(), date: '2026-10-04',
      customerName: 'Priya Sharma', paymentMode: 'UPI',
      items: [{ craftProductId: crafts[0].id, name: crafts[0].name, qty: 3, unitPrice: crafts[0].sellingPrice, costPrice: crafts[0].costPrice }],
      totalAmount: 3 * crafts[0].sellingPrice,
      profit: 3 * (crafts[0].sellingPrice - crafts[0].costPrice),
      isUndone: false, createdAt: new Date('2026-10-04T10:30:00').toISOString()
    },
    {
      id: uuidv4(), date: '2026-10-05',
      customerName: 'Walk-in Customer', paymentMode: 'Cash',
      items: [{ craftProductId: crafts[2].id, name: crafts[2].name, qty: 2, unitPrice: crafts[2].sellingPrice, costPrice: crafts[2].costPrice }],
      totalAmount: 2 * crafts[2].sellingPrice,
      profit: 2 * (crafts[2].sellingPrice - crafts[2].costPrice),
      isUndone: false, createdAt: new Date('2026-10-05T14:00:00').toISOString()
    },
    {
      id: uuidv4(), date: '2026-10-06',
      customerName: 'Rajesh Gupta', paymentMode: 'UPI',
      items: [
        { craftProductId: crafts[1].id, name: crafts[1].name, qty: 1, unitPrice: crafts[1].sellingPrice, costPrice: crafts[1].costPrice },
        { craftProductId: crafts[6].id, name: crafts[6].name, qty: 5, unitPrice: crafts[6].sellingPrice, costPrice: crafts[6].costPrice },
      ],
      totalAmount: crafts[1].sellingPrice + 5 * crafts[6].sellingPrice,
      profit: (crafts[1].sellingPrice - crafts[1].costPrice) + 5 * (crafts[6].sellingPrice - crafts[6].costPrice),
      isUndone: false, createdAt: new Date('2026-10-06T16:45:00').toISOString()
    },
    {
      id: uuidv4(), date: '2026-10-08',
      customerName: 'Anita Verma', paymentMode: 'Cash',
      items: [
        { craftProductId: crafts[3].id, name: crafts[3].name, qty: 1, unitPrice: crafts[3].sellingPrice, costPrice: crafts[3].costPrice },
      ],
      totalAmount: crafts[3].sellingPrice,
      profit: crafts[3].sellingPrice - crafts[3].costPrice,
      isUndone: false, createdAt: new Date('2026-10-08T11:00:00').toISOString()
    },
  ]
  write('sales', sales)

  write('__seeded__', true)
  } catch (err) {
    console.error('seedDemoData failed:', err)
  }
}
