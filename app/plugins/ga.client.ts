export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const id = config.public.gaMeasurementId

  if (!id) return

  nuxtApp.hook("page:finish", () => {
    if (typeof window === "undefined") return
    
    // @ts-ignore
    if (typeof window.gtag !== "function") return

    const route = useRoute()

    // @ts-ignore
    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: route.fullPath,
    })
  })
})