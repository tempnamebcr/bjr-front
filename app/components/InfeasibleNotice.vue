<script setup lang="ts">
defineProps<{
  taskIds: number[]
}>()
</script>

<template>
  <div
    role="alert"
    class="rounded-xl border border-amber-200 bg-amber-50 p-6"
  >
    <h2 class="font-semibold text-amber-900">
      No feasible assignment
    </h2>
    <p class="mt-1 text-sm text-amber-800">
      No employee has the skill level required for
      {{ taskIds.length === 1 ? 'this task' : `these ${taskIds.length} tasks` }}, so they can't be assigned:
    </p>
    <ul class="mt-3 flex flex-wrap gap-2">
      <li
        v-for="taskId in taskIds"
        :key="taskId"
        class="rounded-md bg-white px-2 py-1 text-sm font-medium tabular-nums text-amber-900 ring-1 ring-amber-200"
      >
        Task #{{ taskId }}
      </li>
    </ul>
  </div>
</template>
