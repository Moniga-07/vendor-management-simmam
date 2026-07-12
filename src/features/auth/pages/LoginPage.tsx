import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const { error } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await login({ email, password })
    } catch (err: any) {
      error('Login Failed', err.message || 'Invalid credentials')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-simmam-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-simmam-elevated border border-simmam-gold-border rounded-simmam-xl shadow-2xl p-8"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-simmam-gold/10 border border-simmam-gold/30 flex items-center justify-center mb-4">
              <Shield size={32} className="text-simmam-gold" />
            </div>
            <h1 className="font-display font-bold text-2xl text-simmam-text-primary uppercase tracking-widest text-center">
              SIMMAM Portal
            </h1>
            <p className="text-sm text-simmam-text-muted mt-2 text-center">
              Coordinator Access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="coordinator@simmam.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              className="mt-6"
              isLoading={isSubmitting}
            >
              Sign In to Portal
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
