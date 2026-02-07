<template>
  <div class="default-layout">
    <SiteHeader />
    <main class="page-body">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/config/variables' as *;

.default-layout {
  min-height: 100vh;
  background: $app-BG;
}
</style>
