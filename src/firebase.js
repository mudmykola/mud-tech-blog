import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
let analyticsPromise = null

export { app }

export const initFirebaseAnalytics = async () => {
  if (typeof window === 'undefined') return null
  if (!firebaseConfig.measurementId) return null

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then(supported => (supported ? getAnalytics(app) : null))
      .catch(() => null)
  }

  return analyticsPromise
}

export const trackPageView = async ({ path, title, location }) => {
  const analytics = await initFirebaseAnalytics()
  if (!analytics) return

  logEvent(analytics, 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: location || window.location.href,
  })
}

export const trackEvent = async (eventName, params = {}) => {
  if (!eventName) return
  const analytics = await initFirebaseAnalytics()
  if (!analytics) return
  logEvent(analytics, eventName, params)
}
