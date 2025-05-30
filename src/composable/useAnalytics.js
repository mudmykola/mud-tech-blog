
export const useAnalytics = () => {
    const isProd = process.env.NODE_ENV === 'production'
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

    const loadGA = () => {
        if (!isProd || !measurementId) return

        const script = document.createElement('script')
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
        document.head.appendChild(script)

        window.dataLayer = window.dataLayer || []
        window.gtag = function () {
            window.dataLayer.push(arguments)
        }

        gtag('js', new Date())
        gtag('config', measurementId)
    }

    const trackEvent = ({ action, category, label, value }) => {
        if (typeof window.gtag !== 'function') return
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        })
    }

    return { loadGA, trackEvent }
}