const express = require('express')
const multer = require('multer')
const router = express.Router()

// Configure multer for memory storage (we'll upload directly to Supabase)
const upload = multer({ storage: multer.memoryStorage() })

// Helper to upload file to Supabase Storage
const uploadToSupabase = async (supabase, bucket, file, prefix) => {
  if (!file) return null
  const fileExt = file.originalname.split('.').pop()
  const fileName = `${prefix}_${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    })

  if (error) throw error
  
  // Return the public URL
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return publicUrlData.publicUrl
}

// Get all vendors (with pagination and filters)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query
    
    let query = req.supabase.from('vendors').select('*', { count: 'exact' })
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,vendor_id.ilike.%${search}%,mobile.ilike.%${search}%`)
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status.toUpperCase())
    }
    
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    res.json({
      data,
      count,
      page: Number(page),
      limit: Number(limit)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get single vendor
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('vendors')
      .select('*')
      .eq('id', req.params.id)
      .single()
      
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Register a new vendor (with files)
router.post(
  '/', 
  upload.fields([
    { name: 'photo', maxCount: 1 } // If uploaded as a file
  ]), 
  async (req, res) => {
  try {
    const { name, mobile, company, stall_number, vehicle_number, photoDataUrl } = req.body
    
    // Generate Vendor ID (e.g., VEN0001)
    const { count, error: countError } = await req.supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      
    if (countError) throw countError
    
    const newIdNum = (count || 0) + 1
    const vendor_id = `VEN${String(newIdNum).padStart(4, '0')}`

    // Upload documents
    const files = req.files || {}
    let photoUrl = ''
    
    // Photo could be a file upload OR a base64 string from react-webcam
    if (files.photo) {
      photoUrl = await uploadToSupabase(req.supabase, 'vendor-photos', files.photo[0], 'photo')
    } else if (photoDataUrl) {
      // Decode base64 and upload
      const matches = photoDataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64')
        const fileName = `photo_${Date.now()}.jpg`
        const { error } = await req.supabase.storage
          .from('vendor-photos')
          .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: false })
          
        if (error) throw error
        const { data } = req.supabase.storage.from('vendor-photos').getPublicUrl(fileName)
        photoUrl = data.publicUrl
      }
    }

    // Insert into DB
    const { data, error } = await req.supabase
      .from('vendors')
      .insert({
        vendor_id,
        name,
        mobile,
        company: company || '',
        stall_number,
        vehicle_number,
        photo: photoUrl,
        status: 'OUTSIDE', // Default state
        entry_count: 0
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (err) {
    console.error('Registration Error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Delete vendor
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('vendors')
      .delete()
      .eq('id', req.params.id)
      
    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Dashboard Stats
router.get('/stats/dashboard', async (req, res) => {
  try {
    // We can run parallel queries
    const today = new Date()
    today.setHours(0,0,0,0)

    const [
      { count: totalVendors },
      { count: insideVendors },
      { count: outsideVendors },
      { count: totalEntriesToday },
      { count: totalExitsToday },
    ] = await Promise.all([
      req.supabase.from('vendors').select('*', { count: 'exact', head: true }),
      req.supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'INSIDE'),
      req.supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'OUTSIDE'),
      req.supabase.from('entry_logs').select('*', { count: 'exact', head: true }).eq('action', 'ENTRY').gte('time', today.toISOString()),
      req.supabase.from('entry_logs').select('*', { count: 'exact', head: true }).eq('action', 'EXIT').gte('time', today.toISOString()),
    ])

    res.json({
      totalVendors: totalVendors || 0,
      insideVendors: insideVendors || 0,
      outsideVendors: outsideVendors || 0,
      totalEntriesToday: totalEntriesToday || 0,
      totalExitsToday: totalExitsToday || 0,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
