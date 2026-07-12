const express = require('express')
const router = express.Router()

// Login for Coordinators
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // We are using Supabase Auth for coordinator login
    const { data, error } = await req.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(401).json({ error: error.message })
    }

    // Return the session/user info
    res.json({
      user: data.user,
      session: data.session
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Logout
router.post('/logout', async (req, res) => {
  try {
    // In a real scenario you'd invalidate the token
    // Since we're using Supabase JWTs, the client just discards it
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
