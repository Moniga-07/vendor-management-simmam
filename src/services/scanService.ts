import { api } from '@/lib/api'
import type { Vendor, EntryLog, PaginatedResult } from '@/types'

// ─────────────────────────────────────────────
// Scan Service (Axios -> Express)
// ─────────────────────────────────────────────

export interface ScanResponse {
  success: boolean
  message: string
  vendor?: Vendor
  error?: string
}

export const scanService = {
  async processEntry(vendor_id: string, coordinator_name: string): Promise<ScanResponse> {
    try {
      const { data } = await api.post('/scan/entry', { vendor_id, coordinator_name })
      return data
    } catch (err: any) {
      if (err.response?.data) return err.response.data
      throw err
    }
  },

  async processExit(vendor_id: string, coordinator_name: string): Promise<ScanResponse> {
    try {
      const { data } = await api.post('/scan/exit', { vendor_id, coordinator_name })
      return data
    } catch (err: any) {
      if (err.response?.data) return err.response.data
      throw err
    }
  },

  async getLogs(filters: any = {}, page = 1, limit = 50): Promise<PaginatedResult<EntryLog>> {
    const { data } = await api.get('/scan/logs', {
      params: { ...filters, page, limit }
    })
    return {
      data: data.data,
      count: data.count,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil(data.count / data.limit)
    }
  },

  /** Success beep via Web Audio API */
  playSuccessBeep() {
    try {
      const ctx   = new AudioContext()
      const osc   = ctx.createOscillator()
      const gain  = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch { /* ignore */ }
  },

  /** Error beep */
  playErrorBeep() {
    try {
      const ctx   = new AudioContext()
      const osc   = ctx.createOscillator()
      const gain  = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.setValueAtTime(220, ctx.currentTime)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch { /* ignore */ }
  },

  /** Mobile vibration */
  vibrate(pattern: number | number[] = 200) {
    if ('vibrate' in navigator) navigator.vibrate(pattern)
  },
}
