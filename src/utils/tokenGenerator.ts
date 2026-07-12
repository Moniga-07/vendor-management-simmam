// ─────────────────────────────────────────────
// Secure QR Token Generator
// Format: SIMMAM-XXXXXXXX (8 uppercase alphanumeric chars)
// ─────────────────────────────────────────────

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const TOKEN_LENGTH = 8
const PREFIX = 'SIMMAM-'

/**
 * Generate a cryptographically random QR token.
 * Uses crypto.getRandomValues for true randomness.
 * Example: SIMMAM-9XK4Q8AZ
 */
export function generateQRToken(): string {
  const bytes = new Uint8Array(TOKEN_LENGTH)
  crypto.getRandomValues(bytes)

  let token = PREFIX
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    token += CHARSET[bytes[i] % CHARSET.length]
  }
  return token
}

/**
 * Validate that a token matches the SIMMAM-XXXXXXXX format.
 */
export function isValidQRToken(token: string): boolean {
  return /^SIMMAM-[A-Z0-9]{8}$/.test(token)
}

/**
 * Generate a sequential vendor code. VEN-001, VEN-002, etc.
 */
export function generateVendorCode(index: number): string {
  return `VEN-${String(index).padStart(3, '0')}`
}

/**
 * Extract the token part without prefix for display.
 * SIMMAM-9XK4Q8AZ → 9XK4Q8AZ
 */
export function extractTokenSuffix(token: string): string {
  return token.startsWith(PREFIX) ? token.slice(PREFIX.length) : token
}
