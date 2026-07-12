import type { Vendor, EntryLog } from '@/types'

const toCSV = (data: Record<string, any>[]) => {
  if (data.length === 0) return ''
  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header]
        if (val === null || val === undefined) return '""'
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`
        return `"${val}"`
      })
      .join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const exportVendorsCSV = (vendors: Vendor[]) => {
  const data = vendors.map((v) => ({
    'Vendor ID': v.vendor_id,
    'Name': v.name,
    'Company': v.company || '-',
    'Mobile': v.mobile,
    'Stall': v.stall_number,
    'Vehicle': v.vehicle_number,
    'Status': v.status,
    'Entries': v.entry_count,
    'Registered At': new Date(v.created_at).toLocaleString(),
  }))
  downloadFile(toCSV(data), `simmam-vendors-${Date.now()}.csv`, 'text/csv;charset=utf-8;')
}

export const exportVendorsExcel = (vendors: Vendor[]) => {
  exportVendorsCSV(vendors) // Simple fallback to CSV, real excel requires xlsx library
}

export const exportVendorsPDF = (vendors: Vendor[]) => {
  // Since jsPDF is heavy, typically you'd trigger window.print() on a hidden table.
  // Or fallback to CSV in minimal implementations.
  exportVendorsCSV(vendors)
}

export const exportLogsCSV = (logs: EntryLog[]) => {
  const data = logs.map((log) => ({
    'Log ID': log.id,
    'Vendor ID': log.vendor?.vendor_id || '-',
    'Vendor Name': log.vendor?.name || '-',
    'Action': log.action,
    'Coordinator': log.coordinator,
    'Time': new Date(log.time).toLocaleString(),
  }))
  downloadFile(toCSV(data), `simmam-entry-logs-${Date.now()}.csv`, 'text/csv;charset=utf-8;')
}
