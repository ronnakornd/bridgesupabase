import { initializeApp, getApps } from 'firebase/app'
import { firebaseConfig } from './config'

// Initialize Firebase only if it hasn't been initialized already
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]