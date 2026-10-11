import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import {
  getCollection, addDoc, updateDoc, deleteDoc,
  setCollection, seedDemoData
} from '@/lib/db'

function loadAll() {
  try {
    seedDemoData()
  } catch (e) {
    console.warn('seedDemoData ignored:', e)
  }

  let matShipments = getCollection('materialShipments')
  const rawMaterials = getCollection('rawMaterials') || []
  if (!Array.isArray(matShipments) || matShipments.length === 0) {
    matShipments = (rawMaterials || []).map(m => ({
      id: uuidv4(),
      rawMaterialId: m?.id || uuidv4(),
      quantity: Number(m?.quantity) || 0,
      unitCost: Number(m?.unitCost) || 0,
      totalCost: (Number(m?.quantity) || 0) * (Number(m?.unitCost) || 0),
      date: m?.receivedDate || (typeof m?.createdAt === 'string' ? m.createdAt.slice(0, 10) : '2026-09-01'),
      notes: m?.notes || 'Initial batch intake',
      createdAt: m?.createdAt || new Date().toISOString()
    }))
    setCollection('materialShipments', matShipments)
  }

  const rawMaterialsList  = getCollection('rawMaterials')
  const villagesList      = getCollection('villages')
  const artisansList      = getCollection('artisans')
  const schemaList        = getCollection('artisanFormSchema')
  const craftList         = getCollection('craftProducts')
  const craftShipList     = getCollection('craftShipments')
  const storeDispatchList = getCollection('storeDispatches')
  const dispatchList      = getCollection('dispatches')
  const salesList         = getCollection('sales')
  const adjList           = getCollection('stockAdjustments')

  let invList = getCollection('storeInventory')
  if (!Array.isArray(invList) || invList.length === 0) {
    invList = persistInventory(craftList, storeDispatchList, salesList, adjList)
  }

  return {
    rawMaterials:      rawMaterialsList,
    materialShipments: matShipments,
    villages:          villagesList,
    artisans:          artisansList,
    artisanFormSchema: schemaList,
    craftProducts:     craftList,
    craftShipments:    craftShipList,
    storeDispatches:   storeDispatchList,
    dispatches:        dispatchList,
    storeInventory:    invList,
    sales:             salesList,
    stockAdjustments:  adjList,
  }
}

// ─── Inventory helpers ────────────────────────────────────────────────────────

function recomputeInventory(
  craftProducts = [],
  storeDispatches = [],
  sales = [],
  stockAdjustments = []
) {
  const inv = {}

  // 1. Initialize for all products
  craftProducts.forEach(p => {
    inv[p.id] = 0
  })

  // 2. Add stock sent to store from Craft Catalog
  storeDispatches.forEach(d => {
    inv[d.craftProductId] = (inv[d.craftProductId] || 0) + (Number(d.quantity) || 0)
  })

  // 3. Manual stock adjustments
  stockAdjustments.forEach(a => {
    inv[a.craftProductId] = (inv[a.craftProductId] || 0) + (Number(a.quantity) || 0)
  })

  // 4. Deduct active POS sales
  (sales || []).filter(s => s && !s.isUndone).forEach(s => {
    if (Array.isArray(s.items)) {
      s.items.forEach(i => {
        if (i && i.craftProductId) {
          inv[i.craftProductId] = (inv[i.craftProductId] || 0) - (Number(i.qty) || 0)
        }
      })
    }
  })

  return Object.entries(inv).map(([craftProductId, quantityAvailable]) => ({
    id: craftProductId,
    craftProductId,
    quantityAvailable: Math.max(0, quantityAvailable),
    updatedAt: new Date().toISOString()
  }))
}

function persistInventory(craftProducts, storeDispatches, sales, stockAdjustments) {
  const inv = recomputeInventory(craftProducts, storeDispatches, sales, stockAdjustments)
  setCollection('storeInventory', inv)
  return inv
}

// ─── Store ────────────────────────────────────────────────────────────────────

const useStore = create((set, get) => {
  let initial
  try {
    initial = loadAll()
  } catch (err) {
    console.error('Critical loadAll error:', err)
    try {
      localStorage.clear()
      initial = loadAll()
    } catch (e) {
      initial = {
        rawMaterials: [], materialShipments: [], villages: [], artisans: [],
        artisanFormSchema: [], craftProducts: [], craftShipments: [],
        storeDispatches: [], dispatches: [], storeInventory: [], sales: [], stockAdjustments: [],
      }
    }
  }

  return {
    ...initial,

    reload: () => {
      try { set(loadAll()) } catch (e) { console.error('reload error:', e) }
    },

    // ── Raw Materials ──
    addRawMaterial: (data) => {
      const doc = addDoc('rawMaterials', {
        ...data,
        quantity: Number(data.quantity) || 0,
        unitCost: Number(data.unitCost) || 0
      })
      const firstShipment = addDoc('materialShipments', {
        rawMaterialId: doc.id,
        quantity: Number(data.quantity) || 0,
        unitCost: Number(data.unitCost) || 0,
        totalCost: (Number(data.quantity) || 0) * (Number(data.unitCost) || 0),
        date: data.receivedDate || new Date().toISOString().slice(0, 10),
        notes: data.notes || 'Initial batch intake',
      })
      set(s => ({
        rawMaterials: [...s.rawMaterials, doc],
        materialShipments: [...(s.materialShipments || []), firstShipment]
      }))
      return doc
    },

    receiveMaterialShipment: ({ rawMaterialId, quantity, unitCost, date, notes }) => {
      const qty = Number(quantity)
      const cost = Number(unitCost)
      const shipment = addDoc('materialShipments', {
        rawMaterialId,
        quantity: qty,
        unitCost: cost,
        totalCost: qty * cost,
        date: date || new Date().toISOString().slice(0, 10),
        notes: notes || 'New shipment received',
      })
      const mat = get().rawMaterials.find(m => m.id === rawMaterialId)
      if (mat) {
        const newQty = (Number(mat.quantity) || 0) + qty
        const prevTotal = (Number(mat.quantity) || 0) * (Number(mat.unitCost) || 0)
        const newTotal = prevTotal + (qty * cost)
        const avgCost = newQty > 0 ? Math.round((newTotal / newQty) * 100) / 100 : cost
        const updatedMat = updateDoc('rawMaterials', rawMaterialId, {
          quantity: newQty,
          unitCost: avgCost,
          updatedAt: new Date().toISOString()
        })
        set(s => ({
          rawMaterials: s.rawMaterials.map(m => m.id === rawMaterialId ? updatedMat : m),
          materialShipments: [...(s.materialShipments || []), shipment]
        }))
      }
      return shipment
    },

    updateRawMaterial: (id, data) => {
      const doc = updateDoc('rawMaterials', id, data)
      set(s => ({ rawMaterials: s.rawMaterials.map(m => m.id === id ? doc : m) }))
    },

    deleteRawMaterial: (id) => {
      deleteDoc('rawMaterials', id)
      const filteredShipments = (get().materialShipments || []).filter(s => s.rawMaterialId !== id)
      setCollection('materialShipments', filteredShipments)
      set(s => ({
        rawMaterials: s.rawMaterials.filter(m => m.id !== id),
        materialShipments: filteredShipments
      }))
    },

    // ── Villages ──
    addVillage: (data) => {
      const doc = addDoc('villages', data)
      set(s => ({ villages: [...s.villages, doc] }))
      return doc
    },
    updateVillage: (id, data) => {
      const doc = updateDoc('villages', id, data)
      set(s => ({ villages: s.villages.map(v => v.id === id ? doc : v) }))
    },
    deleteVillage: (id) => {
      deleteDoc('villages', id)
      set(s => ({ villages: s.villages.filter(v => v.id !== id) }))
    },

    // ── Artisan Form Schema ──
    setArtisanFormSchema: (schema) => {
      setCollection('artisanFormSchema', schema)
      set({ artisanFormSchema: schema })
    },

    // ── Artisans ──
    addArtisan: (data) => {
      const doc = addDoc('artisans', data)
      set(s => ({ artisans: [...s.artisans, doc] }))
      return doc
    },
    updateArtisan: (id, data) => {
      const doc = updateDoc('artisans', id, data)
      set(s => ({ artisans: s.artisans.map(a => a.id === id ? doc : a) }))
    },
    deleteArtisan: (id) => {
      deleteDoc('artisans', id)
      set(s => ({ artisans: s.artisans.filter(a => a.id !== id) }))
    },

    // ── Craft Products & Inward Shipments ──
    addCraftProduct: (data) => {
      const doc = addDoc('craftProducts', {
        ...data,
        initialStock: Number(data.initialStock) || 0
      })
      if (Number(data.initialStock) > 0) {
        addDoc('craftShipments', {
          craftProductId: doc.id,
          quantity: Number(data.initialStock),
          costPrice: Number(data.costPrice) || 0,
          date: new Date().toISOString().slice(0, 10),
          notes: data.description ? `Initial batch: ${data.description}` : 'Initial stock intake',
        })
      }
      const newCrafts = [...get().craftProducts, doc]
      const newShipments = getCollection('craftShipments')
      set({ craftProducts: newCrafts, craftShipments: newShipments })
      return doc
    },

    receiveCraftShipment: ({ craftProductId, quantity, costPrice, date, notes }) => {
      const qty = Number(quantity)
      const cost = Number(costPrice) || 0
      const shipment = addDoc('craftShipments', {
        craftProductId,
        quantity: qty,
        costPrice: cost,
        date: date || new Date().toISOString().slice(0, 10),
        notes: notes || 'Batch received',
      })
      const newShipments = [...(get().craftShipments || []), shipment]
      set({ craftShipments: newShipments })
      return shipment
    },

    deleteCraftShipment: (id) => {
      deleteDoc('craftShipments', id)
      const newShipments = (get().craftShipments || []).filter(s => s.id !== id)
      set({ craftShipments: newShipments })
    },

    updateCraftProduct: (id, data) => {
      const doc = updateDoc('craftProducts', id, data)
      const newCrafts = get().craftProducts.map(c => c.id === id ? doc : c)
      const newInv = persistInventory(
        newCrafts,
        get().storeDispatches || [],
        get().sales || [],
        get().stockAdjustments || []
      )
      set({ craftProducts: newCrafts, storeInventory: newInv })
      return doc
    },

    deleteCraftProduct: (id) => {
      deleteDoc('craftProducts', id)
      const newCrafts = get().craftProducts.filter(c => c.id !== id)
      const newShipments = (get().craftShipments || []).filter(s => s.craftProductId !== id)
      const newDispatches = (get().storeDispatches || []).filter(s => s.craftProductId !== id)
      setCollection('craftShipments', newShipments)
      setCollection('storeDispatches', newDispatches)
      const newInv = persistInventory(
        newCrafts,
        newDispatches,
        get().sales || [],
        get().stockAdjustments || []
      )
      set({
        craftProducts: newCrafts,
        craftShipments: newShipments,
        storeDispatches: newDispatches,
        storeInventory: newInv
      })
    },

    // ── Send to Store (Craft Catalog → Store Inventory) ──
    sendToStore: ({ craftProductId, quantity, date, notes }) => {
      const qty = Number(quantity)
      const dispatch = addDoc('storeDispatches', {
        craftProductId,
        quantity: qty,
        date: date || new Date().toISOString().slice(0, 10),
        notes: notes || 'Sent to Store Inventory',
      })
      const newDispatches = [...(get().storeDispatches || []), dispatch]
      const newInv = persistInventory(
        get().craftProducts,
        newDispatches,
        get().sales || [],
        get().stockAdjustments || []
      )
      set({ storeDispatches: newDispatches, storeInventory: newInv })
      return dispatch
    },

    // ── Dispatches (Raw Materials to Village/Artisan) ──
    addDispatch: (data) => {
      const qty = Number(data.quantityDispatched) || 0
      const initialEntry = {
        id: uuidv4(),
        quantity: qty,
        date: data.date || new Date().toISOString().slice(0, 10),
        notes: data.notes || 'Initial batch intake dispatch',
        createdAt: new Date().toISOString()
      }
      const doc = addDoc('dispatches', {
        ...data,
        quantityDispatched: qty,
        history: [initialEntry]
      })
      set(s => ({ dispatches: [...s.dispatches, doc] }))
      return doc
    },
    updateDispatch: (id, data) => {
      const doc = updateDoc('dispatches', id, data)
      set(s => ({ dispatches: s.dispatches.map(d => d.id === id ? doc : d) }))
      return doc
    },
    addQuantityToDispatch: (id, additionalQty, noteAppend) => {
      const current = get().dispatches.find(d => d.id === id)
      if (!current) return null
      const addedQty = Number(additionalQty) || 0
      const updatedQty = (Number(current.quantityDispatched) || 0) + addedQty

      const existingHistory = Array.isArray(current.history) && current.history.length > 0
        ? [...current.history]
        : [{
            id: uuidv4(),
            quantity: Number(current.quantityDispatched) || 0,
            date: current.date || (current.createdAt ? current.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
            notes: current.notes || 'Initial dispatch',
            createdAt: current.createdAt || new Date().toISOString()
          }]

      const newHistoryEntry = {
        id: uuidv4(),
        quantity: addedQty,
        date: new Date().toISOString().slice(0, 10),
        notes: noteAppend || 'Additional quantity added',
        createdAt: new Date().toISOString()
      }
      existingHistory.push(newHistoryEntry)

      const updatedNotes = noteAppend
        ? (current.notes ? `${current.notes} | (+${addedQty}: ${noteAppend})` : `+${addedQty}: ${noteAppend}`)
        : current.notes

      const doc = updateDoc('dispatches', id, {
        quantityDispatched: updatedQty,
        notes: updatedNotes,
        history: existingHistory,
        updatedAt: new Date().toISOString()
      })
      set(s => ({ dispatches: s.dispatches.map(d => d.id === id ? doc : d) }))
      return doc
    },
    deleteDispatch: (id) => {
      deleteDoc('dispatches', id)
      set(s => ({ dispatches: s.dispatches.filter(d => d.id !== id) }))
    },

    // ── Manual Stock Adjustments ──
    adjustStock: ({ craftProductId, quantity, reason }) => {
      const doc = addDoc('stockAdjustments', {
        craftProductId,
        quantity: Number(quantity),
        reason: reason || 'Manual adjustment',
        date: new Date().toISOString()
      })
      const newAdjustments = [...(get().stockAdjustments || []), doc]
      const newInv = persistInventory(
        get().craftProducts,
        get().storeDispatches || [],
        get().sales || [],
        newAdjustments
      )
      set({ stockAdjustments: newAdjustments, storeInventory: newInv })
      return doc
    },

    // ── Sales ──
    addSale: (data) => {
      const doc = addDoc('sales', data)
      const newSales = [...get().sales, doc]
      const newInv = persistInventory(
        get().craftProducts,
        get().storeDispatches || [],
        newSales,
        get().stockAdjustments || []
      )
      set({ sales: newSales, storeInventory: newInv })
      return doc
    },
    undoSale: (id) => {
      const doc = updateDoc('sales', id, { isUndone: true })
      const newSales = get().sales.map(s => s.id === id ? doc : s)
      const newInv = persistInventory(
        get().craftProducts,
        get().storeDispatches || [],
        newSales,
        get().stockAdjustments || []
      )
      set({ sales: newSales, storeInventory: newInv })
    },

    // ── Helpers ──
    getCraftCatalogStats: (craftProductId) => {
      const shipments = (get().craftShipments || []).filter(s => s.craftProductId === craftProductId)
      const storeDispatches = (get().storeDispatches || []).filter(s => s.craftProductId === craftProductId)
      const totalReceived = shipments.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0)
      const totalSentToStore = storeDispatches.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0)
      const catalogBalance = Math.max(0, totalReceived - totalSentToStore)
      return { totalReceived, totalSentToStore, catalogBalance }
    },

    getInventoryQty: (craftProductId) => {
      const inv = (get().storeInventory || []).find(i => i.craftProductId === craftProductId)
      return inv ? inv.quantityAvailable : 0
    },

    getRawMaterialBalance: (materialId) => {
      const mat = (get().rawMaterials || []).find(m => m && m.id === materialId)
      if (!mat) return 0
      const dispatched = (get().dispatches || [])
        .filter(d => d && d.rawMaterialId === materialId)
        .reduce((sum, d) => sum + (Number(d.quantityDispatched) || 0), 0)
      return (Number(mat.quantity) || 0) - dispatched
    },
  }
})

export default useStore
