require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')
const vendorRoutes = require('./routes/vendors.routes')
const authRoutes = require('./routes/auth.routes')
const scanRoutes = require('./routes/scan.routes')
const path = require('path')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Supabase client initialization (using service key to bypass RLS)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Make supabase available in req object
app.use((req, res, next) => {
  req.supabase = supabase
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/scan', scanRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal Server Error' })
})

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, '../dist')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
