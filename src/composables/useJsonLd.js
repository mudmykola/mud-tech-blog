export function useJsonLd(schemas) {
    if (!Array.isArray(schemas)) {
      console.warn("[useJsonLd] schemas має бути масивом")
      return
    }
  
    
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove())
  
   
    schemas.forEach((schema) => {
      const script = document.createElement("script")
      script.type = "application/ld+json"
      script.innerHTML = JSON.stringify(schema, null, 2)
      document.head.appendChild(script)
    })
  }
  