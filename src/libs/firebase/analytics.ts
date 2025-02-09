import { getAnalytics } from 'firebase/analytics'
import { app } from './app'

let analytics: ReturnType<typeof getAnalytics>

// Only initialize analytics on the client side
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

export { analytics }