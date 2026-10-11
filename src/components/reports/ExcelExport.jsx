import * as XLSX from 'xlsx'
import useStore from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Download } from 'lucide-react'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'

export default function ExcelExport() {
  const {
    rawMaterials = [], materialShipments = [], villages = [], artisans = [], artisanFormSchema = [],
    craftProducts = [], craftShipments = [], storeDispatches = [], dispatches = [], sales = [], storeInventory = []
  } = useStore()

  const exportExcel = () => {
    const wb = XLSX.utils.book_new()

    // ── Sheet 1: Raw Materials ──────────────────────────────────────────────
    const matData = rawMaterials.map(m => {
      const dispatched = dispatches.filter(d => d.rawMaterialId === m.id).reduce((s,d) => s + d.quantityDispatched, 0)
      return {
        'Material Name':   m.name,
        'Unit':            m.unit,
        'Qty Received':    m.quantity,
        'Qty Dispatched':  dispatched,
        'Balance':         m.quantity - dispatched,
        'Unit Cost (₹)':   m.unitCost,
        'Total Value (₹)': m.quantity * m.unitCost,
        'Received Date':   formatDate(m.receivedDate || m.createdAt),
        'Notes':           m.notes || '',
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matData.length ? matData : [{}]), 'Raw Materials')

    // ── Sheet 2: Villages ────────────────────────────────────────────────────
    const villageData = villages.map(v => ({
      'Village Name':     v.name,
      'District':         v.district || '',
      'State':            v.state || '',
      'Contact Person':   v.contactPerson || '',
      'Phone':            v.phone || '',
      'Artisan Count':    artisans.filter(a => a.villageId === v.id && a.isActive).length,
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(villageData.length ? villageData : [{}]), 'Villages')

    // ── Sheet 3: Artisans ────────────────────────────────────────────────────
    const artisanData = artisans.map(a => {
      const village = villages.find(v => v.id === a.villageId)
      const f = a.dynamicFields || {}
      return {
        'Village': village?.name || '',
        'First Name': f.firstName || f.fullName || '',
        'Age': f.age || '',
        'Marital Status': f.maritalStatus || '',
        'Caste': f.caste || '',
        'Aadhaar Number': f.aadhaarNumber || '',
        'Education': f.education || '',
        'Trident Relative?': f.tridentRelative || 'No',
        'Trident Relative Details': f.tridentRelativeDetails || '',
        'Phone Number': f.phone || '',
        'Craft Skill': f.craftSkill || '',
        'Status': a.isActive ? 'Active' : 'Inactive',
        'Registered Date': formatDate(a.createdAt),
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(artisanData.length ? artisanData : [{}]), 'Artisans')

    // ── Sheet 4: Dispatches (Plant to Village) ──────────────────────────────
    const dispatchData = dispatches.map(d => {
      const mat     = rawMaterials.find(m => m.id === d.rawMaterialId)
      const village = villages.find(v => v.id === d.villageId)
      const artisan = artisans.find(a => a.id === d.artisanId)
      return {
        'Date':                formatDate(d.date || d.createdAt),
        'Material':            mat?.name || '',
        'Unit':                mat?.unit || '',
        'Qty Dispatched':      d.quantityDispatched,
        'Destination Village': village?.name || '',
        'Artisan':             artisan?.dynamicFields?.fullName || 'Village General',
        'Notes':               d.notes || '',
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dispatchData.length ? dispatchData : [{}]), 'Plant Dispatches')

    // ── Sheet 5: Store Inventory ─────────────────────────────────────────────
    const invData = storeInventory.map(i => {
      const product = craftProducts.find(p => p.id === i.craftProductId)
      return {
        'Product':          product?.name || '',
        'Category':         product?.category || '',
        'Unit':             product?.unit || '',
        'Qty Available':    i.quantityAvailable,
        'Cost Price (₹)':   product?.costPrice || 0,
        'Selling Price (₹)':product?.sellingPrice || 0,
        'Retail Stock Value (₹)': (product?.sellingPrice || 0) * i.quantityAvailable,
        'Status':           i.quantityAvailable <= 0 ? 'Out of Stock' : i.quantityAvailable <= 5 ? 'Low Stock' : 'In Stock',
        'Last Updated':     formatDateTime(i.updatedAt),
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invData.length ? invData : [{}]), 'Store Inventory')

    // ── Sheet 6: Sales ───────────────────────────────────────────────────────
    const salesRows = []
    ;(sales || []).forEach(s => {
      if (Array.isArray(s.items)) {
        s.items.forEach((item, idx) => {
          if (!item) return
          salesRows.push({
            'Sale Date':      formatDate(s.date),
            'Sale Time':      formatDateTime(s.createdAt),
            'Customer':       s.customerName,
            'Payment Mode':   s.paymentMode,
            'Product':        item.name || 'Craft',
            'Qty':            item.qty || 0,
            'Unit Price (₹)': item.unitPrice || 0,
            'Item Total (₹)': (item.unitPrice || 0) * (item.qty || 0),
            'Cost Price (₹)': item.costPrice || 0,
            'Item Profit (₹)':  ((item.unitPrice || 0) - (item.costPrice || 0)) * (item.qty || 0),
            'Sale Total (₹)': idx === 0 ? s.totalAmount : '',
            'Sale Profit (₹)':idx === 0 ? s.profit : '',
            'Status':         s.isUndone ? 'Undone' : 'Completed',
          })
        })
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesRows.length ? salesRows : [{}]), 'Sales')

    // ── Sheet 7: Raw Material Shipments Ledger ───────────────────────────────
    const matShipmentRows = (materialShipments || []).map(s => {
      const mat = rawMaterials.find(m => m.id === s.rawMaterialId)
      return {
        'Date':          formatDate(s.date || s.createdAt),
        'Material':      mat?.name || '—',
        'Unit':          mat?.unit || '—',
        'Batch Qty':     s.quantity,
        'Unit Cost (₹)': s.unitCost,
        'Batch Value (₹)': s.totalCost || (s.quantity * s.unitCost),
        'Story / Notes': s.notes || '',
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matShipmentRows.length ? matShipmentRows : [{}]), 'Raw Mat Shipments')

    // ── Sheet 8: Craft Intake Batches ───────────────────────────────────────
    const craftShipmentRows = (craftShipments || []).map(s => {
      const prod = craftProducts.find(p => p.id === s.craftProductId)
      return {
        'Date':          formatDate(s.date || s.createdAt),
        'Craft Product': prod?.name || '—',
        'Category':      prod?.category || '—',
        'Batch Qty':     s.quantity,
        'Unit':          prod?.unit || 'pcs',
        'Cost Price (₹)': s.costPrice || prod?.costPrice || 0,
        'Notes':         s.notes || '',
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(craftShipmentRows.length ? craftShipmentRows : [{}]), 'Craft Catalog Batches')

    // ── Sheet 9: Sent to Store Ledger ───────────────────────────────────────
    const storeDispatchRows = (storeDispatches || []).map(d => {
      const prod = craftProducts.find(p => p.id === d.craftProductId)
      return {
        'Date':          formatDate(d.date || d.createdAt),
        'Craft Product': prod?.name || '—',
        'Category':      prod?.category || '—',
        'Qty Sent':      d.quantity,
        'Unit':          prod?.unit || 'pcs',
        'Notes':         d.notes || '',
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(storeDispatchRows.length ? storeDispatchRows : [{}]), 'Sent to Store Ledger')

    // ── Sheet 10: Summary ───────────────────────────────────────────────────
    const activeSales = sales.filter(s => !s.isUndone)
    const totalRevenue = activeSales.reduce((s, x) => s + x.totalAmount, 0)
    const totalProfit  = activeSales.reduce((s, x) => s + x.profit, 0)
    const totalSentToStore = storeDispatches.reduce((s, d) => s + d.quantity, 0)

    const summaryData = [
      { 'Metric': 'Total Sales Transactions', 'Value': activeSales.length },
      { 'Metric': 'Total Revenue (₹)',          'Value': totalRevenue },
      { 'Metric': 'Total Profit (₹)',            'Value': totalProfit },
      { 'Metric': 'Profit Margin (%)',           'Value': totalRevenue > 0 ? `${Math.round(totalProfit/totalRevenue*100)}%` : '0%' },
      { 'Metric': 'Craft Items Sent to Store',   'Value': totalSentToStore },
      { 'Metric': 'Active Villages',             'Value': villages.length },
      { 'Metric': 'Registered Artisans',         'Value': artisans.filter(a=>a.isActive).length },
      { 'Metric': 'Product Types',               'Value': craftProducts.length },
      { 'Metric': 'Raw Material Types',          'Value': rawMaterials.length },
      { 'Metric': 'Report Generated At',         'Value': formatDateTime(new Date().toISOString()) },
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'Summary')

    // Save
    XLSX.writeFile(wb, `Hastkala_Report_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  return (
    <Button onClick={exportExcel} variant="success">
      <Download className="w-4 h-4" />
      Export All Data (.xlsx)
    </Button>
  )
}
