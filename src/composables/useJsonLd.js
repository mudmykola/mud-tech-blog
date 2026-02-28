const MANAGED_SELECTOR = 'script[type="application/ld+json"][data-mm-jsonld="true"]'

const buildSchemaKey = (schema, index) => {
  const schemaType = schema?.['@type'] || 'Schema'
  const identity =
    schema?.headline || schema?.name || schema?.url || schema?.mainEntityOfPage?.['@id'] || String(index)
  return `${schemaType}:${identity}`
}

export function useJsonLd(schemas) {
  if (!Array.isArray(schemas)) {
    console.warn('[useJsonLd] schemas має бути масивом')
    return
  }

  if (typeof document === 'undefined') return

  const managedScripts = new Map()
  document.querySelectorAll(MANAGED_SELECTOR).forEach(script => {
    if (script.dataset.mmJsonldKey) {
      managedScripts.set(script.dataset.mmJsonldKey, script)
    }
  })

  const activeKeys = new Set()

  schemas.forEach((schema, index) => {
    if (!schema || typeof schema !== 'object') return
    const key = buildSchemaKey(schema, index)
    activeKeys.add(key)

    const payload = JSON.stringify(schema, null, 2)
    const existing = managedScripts.get(key)

    if (existing) {
      if (existing.textContent !== payload) {
        existing.textContent = payload
      }
      managedScripts.delete(key)
      return
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.mmJsonld = 'true'
    script.dataset.mmJsonldKey = key
    script.textContent = payload
    document.head.appendChild(script)
  })

  managedScripts.forEach((script, key) => {
    if (!activeKeys.has(key)) {
      script.remove()
    }
  })
}
