<template>
  <div
    role="status"
    aria-live="polite"
    class="space-y-4"
  >
    <span class="sr-only">Loading assignments…</span>
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="n in 4"
        :key="n"
        class="h-24 animate-pulse rounded-xl bg-slate-200"
      />
    </div>
    <div class="h-64 animate-pulse rounded-xl bg-slate-200" />
  </div>
</template>
