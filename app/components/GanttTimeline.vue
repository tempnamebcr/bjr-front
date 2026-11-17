<script setup lang="ts">
import type { AxisTick, TimelineLane } from '~/utils/assignment'
import { formatHours, formatNumber } from '~/utils/format'

defineProps<{
  lanes: TimelineLane[]
  ticks: AxisTick[]
}>()

/** Block colour by the task's required skill: darker = more senior work. */
const SKILL_CLASSES: Record<number, string> = {
  1: 'bg-sky-200 text-sky-900',
  2: 'bg-sky-500 text-white',
  3: 'bg-indigo-700 text-white',
}

const skillClass = (skill: number): string => SKILL_CLASSES[skill] ?? 'bg-slate-400 text-white'
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <!-- Fixed minimum width: on small screens the timeline scrolls instead of squashing 1 h blocks. -->
    <div class="min-w-[40rem] space-y-1.5">
      <div
        v-for="lane in lanes"
        :key="lane.employeeId"
        class="grid grid-cols-[6rem_1fr] items-center gap-3"
      >
        <span
          class="text-sm"
          :class="{ 'text-slate-400': lane.blocks.length === 0 }"
        >
          Employee {{ lane.employeeId }}
        </span>

        <div class="relative h-7 rounded bg-slate-50">
          <!-- Position/width are data → inline style (Tailwind can't generate runtime values). -->
          <div
            v-for="block in lane.blocks"
            :key="block.taskId"
            class="absolute inset-y-0 flex items-center justify-center overflow-hidden rounded-sm border-r-2 border-white text-xs font-medium"
            :class="skillClass(block.requiredSkill)"
            :style="{ left: `${block.leftPercent}%`, width: `${block.widthPercent}%` }"
            :title="`Task #${block.taskId} · skill ${block.requiredSkill} · ${formatNumber(block.start)}–${formatHours(block.end)}`"
          >
            {{ block.taskId }}
          </div>
        </div>
      </div>

      <!-- Hour axis, aligned with the track column. -->
      <div class="grid grid-cols-[6rem_1fr] gap-3 pt-1">
        <span class="text-xs text-slate-500">Hours</span>
        <div class="relative h-4">
          <span
            v-for="tick in ticks"
            :key="tick.hour"
            class="absolute -translate-x-1/2 text-xs tabular-nums text-slate-500"
            :style="{ left: `${tick.percent}%` }"
          >
            {{ formatNumber(tick.hour) }}
          </span>
        </div>
      </div>
    </div>

    <p class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
      <span>Block = task (number = task id), coloured by required skill:</span>
      <span
        v-for="skill in [1, 2, 3]"
        :key="skill"
        class="flex items-center gap-1.5"
      >
        <span
          class="size-3 rounded-sm"
          :class="skillClass(skill)"
        />
        Skill {{ skill }}
      </span>
    </p>
  </div>
</template>
