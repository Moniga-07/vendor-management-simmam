const express = require('express')
const router = express.Router()

// Process an ENTRY scan
router.post('/entry', async (req, res) => {
  try {
    const { vendor_id, coordinator_name } = req.body

    // 1. Find vendor by vendor_id (e.g. VEN0001)
    const { data: vendor, error } = await req.supabase
      .from('vendors')
      .select('*')
      .eq('vendor_id', vendor_id)
      .single()

    if (error || !vendor) {
      return res.status(404).json({ error: 'Vendor not found' })
    }

    // 2. Check current status
    if (vendor.status === 'INSIDE') {
      return res.status(400).json({ error: 'Vendor is already inside.' })
    }

    // 3. Update status and entry_count
    const { error: updateError } = await req.supabase
      .from('vendors')
      .update({ 
        status: 'INSIDE',
        entry_count: vendor.entry_count + 1
      })
      .eq('id', vendor.id)

    if (updateError) throw updateError

    // 4. Create Entry Log
    const { error: logError } = await req.supabase
      .from('entry_logs')
      .insert({
        vendor_id: vendor.id,
        action: 'ENTRY',
        coordinator: coordinator_name || 'Unknown'
      })

    if (logError) throw logError

    res.json({ success: true, message: 'Entry Successful', vendor })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Process an EXIT scan
router.post('/exit', async (req, res) => {
  try {
    const { vendor_id, coordinator_name } = req.body

    // 1. Find vendor
    const { data: vendor, error } = await req.supabase
      .from('vendors')
      .select('*')
      .eq('vendor_id', vendor_id)
      .single()

    if (error || !vendor) {
      return res.status(404).json({ error: 'Vendor not found' })
    }

    // 2. Check current status
    if (vendor.status === 'OUTSIDE') {
      return res.status(400).json({ error: 'Vendor is already outside.' })
    }

    // 3. Update status
    const { error: updateError } = await req.supabase
      .from('vendors')
      .update({ status: 'OUTSIDE' })
      .eq('id', vendor.id)

    if (updateError) throw updateError

    // 4. Create Exit Log
    const { error: logError } = await req.supabase
      .from('entry_logs')
      .insert({
        vendor_id: vendor.id,
        action: 'EXIT',
        coordinator: coordinator_name || 'Unknown'
      })

    if (logError) throw logError

    res.json({ success: true, message: 'Exit Successful', vendor })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get recent logs (for dashboard/history)
router.get('/logs', async (req, res) => {
  try {
    const { limit = 20, page = 1, search } = req.query
    
    // Need to fetch logs and join with vendor details
    let query = req.supabase
      .from('entry_logs')
      .select(`
        *,
        vendor:vendors (name, vendor_id, company, mobile, vehicle_number)
      `, { count: 'exact' })

    // Advanced search on joined tables requires RPC or PostgREST filtering syntax
    if (search) {
      // Simplified: filter on action or coordinator for now
      // Or we can fetch and filter if needed, or use a view for complex searching
      query = query.or(`coordinator.ilike.%${search}%,action.ilike.%${search}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await query
      .order('time', { ascending: false })
      .range(from, to)

    if (error) throw error

    res.json({ data, count, page: Number(page), limit: Number(limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
