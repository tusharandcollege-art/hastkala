import { useState, useMemo } from 'react'
import * as XLSX from 'xlsx'
import useStore from '@/store/useStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatDateTime, formatCurrency, today } from '@/lib/utils'
import {
  FileSpreadsheet, Download, Calendar, Layers, CheckCircle2,
  Package, ShoppingCart, Users, MapPin, Truck, SlidersHorizontal,
  ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react'

export default function ReportsPage() {
  const {
    rawMaterials = [],
    materialShipments = [],
    villages = [],
    artisans = [],
    craftProducts = [],
    craftShipments = [],
    storeDispatches = [],
    dispatches = [],
    sales = [],
    stockAdjustments = []
  } = useStore()

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [downloadSuccess, setDownloadSuccess] = useState('')

  const showSuccess = (msg) => {
    setDownloadSuccess(msg)
    setTimeout(() => setDownloadSuccess(''), 4500)
  }

  // Filtered sales & adjustments by date
  const filteredSales = useMemo(() => {
    return (sales || []).filter(s => {
      if (!s) return false
      if (dateFrom && s.date < dateFrom) return false
      if (dateTo && s.date > dateTo) return false
      return true
    })
  }, [sales, dateFrom, dateTo])

  const filteredDispatches = useMemo(() => {
    return (dispatches || []).filter(d => {
      if (!d) return false
      if (dateFrom && d.date < dateFrom) return false
      if (dateTo && d.date > dateTo) return false
      return true
    })
  }, [dispatches, dateFrom, dateTo])

  // Helper: compute live stock per product
  const getProductStock = (productId) => {
    const disps = (storeDispatches || []).filter(d => d.craftProductId === productId)
    const adjs = (stockAdjustments || []).filter(a => a.craftProductId === productId)
    const activeS = (sales || []).filter(s => s && !s.isUndone)

    const totalSent = disps.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0)
    const totalAdj = adjs.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0)
    const totalSold = activeS.reduce((sum, s) => {
      if (!Array.isArray(s.items)) return sum
      const itemSold = s.items
        .filter(i => i && i.craftProductId === productId)
        .reduce((iSum, i) => iSum + (Number(i.qty) || 0), 0)
      return sum + itemSold
    }, 0)

    return Math.max(0, totalSent + totalAdj - totalSold)
  }

  // ─── 1. Export Full Master Backup (All in 1 Workbook) ───────────────────────
  const exportMasterWorkbook = () => {
    const wb = XLSX.utils.book_new()

    // Sheet: Products & Live Stock
    const productRows = craftProducts.map(p => {
      const liveStock = getProductStock(p.id)
      return {
        'Product Name': p.name,
        'Category': p.category || '',
        'Unit': p.unit || 'pcs',
        'Cost Price (₹)': Number(p.costPrice) || 0,
        'Selling Price (₹)': Number(p.sellingPrice) || 0,
        'Available Stock': liveStock,
        'Stock Valuation (₹)': liveStock * (Number(p.sellingPrice) || 0),
        'Cost Valuation (₹)': liveStock * (Number(p.costPrice) || 0),
        'Status': liveStock <= 0 ? 'Out of Stock' : liveStock <= 5 ? 'Low Stock' : 'In Stock',
        'Description': p.description || ''
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productRows.length ? productRows : [{}]), 'Products & Stock')

    // Sheet: Sales Records
    const salesRows = []
    filteredSales.forEach(s => {
      if (Array.isArray(s.items)) {
        s.items.forEach((item, idx) => {
          if (!item) return
          salesRows.push({
            'Receipt ID': s.id?.slice(0, 8),
            'Date': formatDate(s.date),
            'Customer': s.customerName || 'Walk-in',
            'Payment Mode': s.paymentMode || 'Cash',
            'Item Name': item.name || '',
            'Quantity': item.qty || 0,
            'Unit Price (₹)': item.unitPrice || 0,
            'Line Total (₹)': (item.unitPrice || 0) * (item.qty || 0),
            'Item Profit (₹)': ((item.unitPrice || 0) - (item.costPrice || 0)) * (item.qty || 0),
            'Receipt Total (₹)': idx === 0 ? s.totalAmount : '',
            'Receipt Net Profit (₹)': idx === 0 ? s.profit : '',
            'Status': s.isUndone ? 'Undone / Returned' : 'Completed'
          })
        })
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesRows.length ? salesRows : [{}]), 'POS Sales')

    // Sheet: Artisans
    const artisanRows = artisans.map(a => {
      const v = villages.find(vil => vil.id === a.villageId)
      const f = a.dynamicFields || {}
      return {
        'Artisan Name': f.firstName || f.fullName || '',
        'Village': v?.name || '',
        'District': v?.district || '',
        'Age': f.age || '',
        'Marital Status': f.maritalStatus || '',
        'Caste': f.caste || '',
        'Aadhaar Number': f.aadhaarNumber || '',
        'Education': f.education || '',
        'Relative in Trident?': f.tridentRelative || 'No',
        'Trident Details': f.tridentRelativeDetails || '',
        'Phone': f.phone || '',
        'Primary Skill': f.craftSkill || '',
        'Status': a.isActive ? 'Active' : 'Inactive',
        'Registered Date': formatDate(a.createdAt)
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(artisanRows.length ? artisanRows : [{}]), 'Artisans')

    // Sheet: Villages
    const villageRows = villages.map(v => ({
      'Village Name': v.name,
      'District': v.district || '',
      'State': v.state || '',
      'Contact Person': v.contactPerson || '',
      'Phone': v.phone || '',
      'Active Artisans': artisans.filter(a => a.villageId === v.id && a.isActive).length
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(villageRows.length ? villageRows : [{}]), 'Villages')

    // Sheet: Raw Materials
    const rawRows = rawMaterials.map(m => {
      const sent = dispatches.filter(d => d.rawMaterialId === m.id).reduce((s, d) => s + (Number(d.quantityDispatched) || 0), 0)
      return {
        'Material Name': m.name,
        'Unit': m.unit,
        'Total Received': m.quantity,
        'Dispatched to Artisans': sent,
        'Current Balance': (Number(m.quantity) || 0) - sent,
        'Unit Cost (₹)': m.unitCost,
        'Total Valuation (₹)': (Number(m.quantity) || 0) * (Number(m.unitCost) || 0),
        'Notes': m.notes || ''
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rawRows.length ? rawRows : [{}]), 'Raw Materials')

    // Sheet: Stock Adjustments & Audit
    const adjRows = stockAdjustments.map(a => {
      const p = craftProducts.find(prod => prod.id === a.craftProductId)
      return {
        'Date': formatDate(a.date),
        'Product': p?.name || '',
        'Adjustment Quantity': a.quantity > 0 ? `+${a.quantity}` : a.quantity,
        'Reason': a.reason || 'Manual Audit',
        'Previous Stock': a.previousStock !== undefined ? a.previousStock : '',
        'New Stock': a.newStock !== undefined ? a.newStock : '',
        'Audit Notes': a.notes || ''
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(adjRows.length ? adjRows : [{}]), 'Stock Adjustments')

    XLSX.writeFile(wb, `Hastkala_Master_Report_${today()}.xlsx`)
    showSuccess('Exported Complete Master Backup Excel Workbook!')
  }

  // ─── 2. Export Products & Inventory Only ────────────────────────────────────
  const exportProductsExcel = () => {
    const wb = XLSX.utils.book_new()
    const rows = craftProducts.map(p => {
      const liveStock = getProductStock(p.id)
      return {
        'Product Name': p.name,
        'Category': p.category || '',
        'Unit': p.unit || 'pcs',
        'Cost Price (₹)': Number(p.costPrice) || 0,
        'Selling Price (₹)': Number(p.sellingPrice) || 0,
        'Available Stock': liveStock,
        'Retail Stock Valuation (₹)': liveStock * (Number(p.sellingPrice) || 0),
        'Cost Stock Valuation (₹)': liveStock * (Number(p.costPrice) || 0),
        'Status': liveStock <= 0 ? 'Out of Stock' : liveStock <= 5 ? 'Low Stock' : 'In Stock'
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{}]), 'Inventory Stock')
    XLSX.writeFile(wb, `Hastkala_Products_Inventory_${today()}.xlsx`)
    showSuccess('Exported Products & Live Stock Report!')
  }

  // ─── 3. Export Sales Only ──────────────────────────────────────────────────
  const exportSalesExcel = () => {
    const wb = XLSX.utils.book_new()
    const salesRows = []
    filteredSales.forEach(s => {
      if (Array.isArray(s.items)) {
        s.items.forEach((item, idx) => {
          if (!item) return
          salesRows.push({
            'Receipt ID': s.id?.slice(0, 8),
            'Date': formatDate(s.date),
            'Customer': s.customerName || 'Walk-in',
            'Payment Mode': s.paymentMode || 'Cash',
            'Item Name': item.name || '',
            'Quantity': item.qty || 0,
            'Unit Price (₹)': item.unitPrice || 0,
            'Line Total (₹)': (item.unitPrice || 0) * (item.qty || 0),
            'Item Profit (₹)': ((item.unitPrice || 0) - (item.costPrice || 0)) * (item.qty || 0),
            'Sale Total (₹)': idx === 0 ? s.totalAmount : '',
            'Sale Net Profit (₹)': idx === 0 ? s.profit : '',
            'Status': s.isUndone ? 'Undone / Returned' : 'Completed'
          })
        })
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesRows.length ? salesRows : [{}]), 'Sales Ledger')
    XLSX.writeFile(wb, `Hastkala_Sales_Report_${today()}.xlsx`)
    showSuccess('Exported Sales Ledger Report!')
  }

  // ─── 4. Export Artisans Only ───────────────────────────────────────────────
  const exportArtisansExcel = () => {
    const wb = XLSX.utils.book_new()
    const rows = artisans.map(a => {
      const v = villages.find(vil => vil.id === a.villageId)
      const f = a.dynamicFields || {}
      return {
        'Artisan Name': f.firstName || f.fullName || '',
        'Village': v?.name || '',
        'District': v?.district || '',
        'Age': f.age || '',
        'Marital Status': f.maritalStatus || '',
        'Caste': f.caste || '',
        'Aadhaar Number': f.aadhaarNumber || '',
        'Education': f.education || '',
        'Relative in Trident?': f.tridentRelative || 'No',
        'Trident Details': f.tridentRelativeDetails || '',
        'Phone': f.phone || '',
        'Primary Skill': f.craftSkill || '',
        'Status': a.isActive ? 'Active' : 'Inactive',
        'Registered Date': formatDate(a.createdAt)
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{}]), 'Artisans')
    XLSX.writeFile(wb, `Hastkala_Artisans_Directory_${today()}.xlsx`)
    showSuccess('Exported Artisans Directory Report!')
  }

  // ─── 5. Export Raw Materials & Dispatches ──────────────────────────────────
  const exportRawMaterialsExcel = () => {
    const wb = XLSX.utils.book_new()
    const rawRows = rawMaterials.map(m => {
      const sent = dispatches.filter(d => d.rawMaterialId === m.id).reduce((s, d) => s + (Number(d.quantityDispatched) || 0), 0)
      return {
        'Material Name': m.name,
        'Unit': m.unit,
        'Total Received': m.quantity,
        'Dispatched to Artisans': sent,
        'Current Balance': (Number(m.quantity) || 0) - sent,
        'Unit Cost (₹)': m.unitCost,
        'Total Stock Value (₹)': (Number(m.quantity) || 0) * (Number(m.unitCost) || 0),
        'Notes': m.notes || ''
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rawRows.length ? rawRows : [{}]), 'Raw Materials')

    const dispRows = filteredDispatches.map(d => {
      const mat = rawMaterials.find(m => m.id === d.rawMaterialId)
      const vil = villages.find(v => v.id === d.villageId)
      const art = artisans.find(a => a.id === d.artisanId)
      return {
        'Dispatch Date': formatDate(d.date),
        'Material': mat?.name || '',
        'Quantity Dispatched': d.quantityDispatched,
        'Unit': mat?.unit || '',
        'Destination Village': vil?.name || '',
        'Assigned Artisan': art?.dynamicFields?.firstName || art?.dynamicFields?.fullName || 'General Cluster',
        'Notes': d.notes || ''
      }
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dispRows.length ? dispRows : [{}]), 'Plant Dispatches')

    XLSX.writeFile(wb, `Hastkala_Raw_Materials_${today()}.xlsx`)
    showSuccess('Exported Raw Materials & Dispatches Report!')
  }

  const reportsList = [
    {
      title: 'Complete Master Backup (All Sheets)',
      desc: 'All 6 modules (Products, Stock, Sales, Artisans, Villages, Materials, Adjustments) in a single multi-sheet Excel file.',
      badge: 'All-in-One Workbook',
      icon: Layers,
      color: 'bg-primary-50 text-primary-600 border-primary-200',
      btnColor: 'primary',
      action: exportMasterWorkbook
    },
    {
      title: 'Products & Live Stock Report',
      desc: 'Current available shelf stock, retail prices, cost valuations, and inventory status per product.',
      badge: `${craftProducts.length} Products`,
      icon: Package,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      btnColor: 'primary',
      action: exportProductsExcel
    },
    {
      title: 'Sales & Revenue Ledger',
      desc: 'Detailed itemized POS sales transactions with customer names, payment mode, receipts, and margins.',
      badge: `${filteredSales.length} Transactions`,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      btnColor: 'primary',
      action: exportSalesExcel
    },
    {
      title: 'Artisans & Villages Directory',
      desc: 'Artisan profiles, villages, skills, contact phone numbers, and Trident relative verification details.',
      badge: `${artisans.length} Artisans`,
      icon: Users,
      color: 'bg-violet-50 text-violet-600 border-violet-200',
      btnColor: 'primary',
      action: exportArtisansExcel
    },
    {
      title: 'Raw Materials & Plant Dispatches',
      desc: 'Intake batches of materials, costs, dispatched quantities, and remaining cluster balance.',
      badge: `${rawMaterials.length} Materials`,
      icon: Truck,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      btnColor: 'primary',
      action: exportRawMaterialsExcel
    }
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast */}
      {downloadSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] sm:w-full px-2 animate-fade-in">
          <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-2xl border border-gray-700 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Excel Downloaded</p>
              <p className="text-xs text-gray-200 font-medium">{downloadSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-amber-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-gray-900">Excel Export & Reports Hub</h2>
          </div>
          <p className="text-xs text-gray-600 max-w-xl">
            Export real-time data directly to clean <code>.xlsx</code> spreadsheets for accounting, government CSR compliance, auditing, and offline analysis.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={exportMasterWorkbook}
          className="shadow-md shadow-amber-500/10 whitespace-nowrap py-3 font-bold"
        >
          <Download className="w-4 h-4" />
          Download Master Backup Excel
        </Button>
      </div>

      {/* Date Range Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Date Filter (for Sales & Dispatches):</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="text-gray-400 font-medium">From:</label>
          <input
            type="date"
            className="input w-auto text-xs py-1.5"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="text-gray-400 font-medium">To:</label>
          <input
            type="date"
            className="input w-auto text-xs py-1.5"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); }}
            className="text-xs text-red-500 hover:text-red-700 font-medium underline"
          >
            Clear Date Filter
          </button>
        )}
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportsList.map((r, idx) => {
          const Icon = r.icon
          return (
            <div
              key={r.title}
              className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                idx === 0 ? 'border-amber-300 md:col-span-2 lg:col-span-1 bg-gradient-to-b from-amber-50/30 to-white' : 'border-gray-100'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-3 rounded-2xl border ${r.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                    {r.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-gray-900 leading-snug">{r.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{r.desc}</p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-gray-100">
                <Button
                  variant={idx === 0 ? 'primary' : 'secondary'}
                  className="w-full justify-center text-xs font-bold py-2.5"
                  onClick={r.action}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export to Excel (.xlsx)
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Tips */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-bold text-gray-800">Direct Excel Compatibility</p>
          <p>
            Generated files are 100% native <code>.xlsx</code> workbooks formatted for Microsoft Excel, Google Sheets, LibreOffice, and Apple Numbers. Formulas, columns, and currency formatting are pre-configured.
          </p>
        </div>
      </div>
    </div>
  )
}
