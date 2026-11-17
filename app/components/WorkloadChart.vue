<script setup lang="ts">
import type { WorkloadBar } from '~/utils/assignment'
import { formatHours } from '~/utils/format'

defineProps<{
  bars: WorkloadBar[]
  makespan: number
}>()
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <ul class="space-y-2">
      <li
        v-for="bar in bars"
        :key="bar.employeeId"
        class="grid grid-cols-[6rem_1fr_4.5rem] items-center gap-3 text-sm"
        :class="{ 'text-slate-400': bar.isIdle }"
      >
        <span :class="bar.isCritical ? 'font-semibold text-amber-700' : ''">
          Employee {{ bar.employeeId }}
        </span>

        <!-- Track = the makespan; fill = this employee's share of it. -->
        <div
          class="h-5 rounded bg-slate-100"
          :class="{ 'ring-1 ring-amber-400': bar.isCritical }"
          aria-hidden="true"
        >
          <!-- Width is data, so it's an inline style: Tailwind can't generate classes for runtime values. -->
          <div
            class="h-full rounded"
            :class="bar.isCritical ? 'bg-amber-500' : 'bg-sky-500'"
            :style="{ width: `${bar.percent}%` }"
          />
        </div>

        <span class="text-right tabular-nums">
          <template v-if="bar.isIdle">idle</template>
          <template v-else>
            {{ formatHours(bar.hours) }}
            <span class="sr-only">{{ bar.isCritical ? '(finishes last)' : '' }}</span>
          </template>
        </span>
      </li>
    </ul>

    <p class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
      <span class="flex items-center gap-1.5">
        <span class="size-3 rounded-sm bg-amber-500" />
        Load equals the makespan ({{ formatHours(makespan) }})
      </span>
      <span class="flex items-center gap-1.5">
        <span class="size-3 rounded-sm bg-sky-500" />
        Assigned hours
      </span>
      <span class="flex items-center gap-1.5">
        <span class="size-3 rounded-sm bg-slate-100 ring-1 ring-slate-200" />
        Idle (0 h)
      </span>
    </p>
  </div>
</template>
