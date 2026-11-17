<script setup lang="ts">
import type { AssignmentRow } from '~/utils/assignment'
import { formatHours, formatPrice } from '~/utils/format'

defineProps<{
  rows: AssignmentRow[]
  /** Totals of `rows`, computed by the caller. */
  totals: { hours: number, cost: number }
}>()

const headers = ['Task', 'Required skill', 'Hours', 'Employee', 'Employee skill', 'Hourly rate', 'Task cost']
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
    <table class="min-w-full text-sm">
      <thead class="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
        <tr>
          <th
            v-for="(header, index) in headers"
            :key="header"
            scope="col"
            class="px-4 py-3"
            :class="{ 'text-right': index >= 2 }"
          >
            {{ header }}
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100 tabular-nums">
        <tr
          v-for="row in rows"
          :key="row.taskId"
          class="hover:bg-slate-50"
        >
          <td class="px-4 py-2 font-medium">
            #{{ row.taskId }}
          </td>
          <td class="px-4 py-2">
            {{ row.requiredSkill }}
          </td>
          <td class="px-4 py-2 text-right">
            {{ formatHours(row.hours) }}
          </td>
          <td class="px-4 py-2 text-right">
            {{ row.employeeId }}
          </td>
          <td class="px-4 py-2 text-right">
            {{ row.employeeSkill }}
          </td>
          <td class="px-4 py-2 text-right">
            {{ formatPrice(row.hourlyRate) }}
          </td>
          <td class="px-4 py-2 text-right font-medium">
            {{ formatPrice(row.taskCost) }}
          </td>
        </tr>

        <tr v-if="rows.length === 0">
          <td
            :colspan="headers.length"
            class="px-4 py-8 text-center text-slate-500"
          >
            No assignments for this selection.
          </td>
        </tr>
      </tbody>

      <tfoot
        v-if="rows.length > 0"
        class="border-t border-slate-200 bg-slate-50 font-medium tabular-nums"
      >
        <tr>
          <th
            scope="row"
            colspan="2"
            class="px-4 py-3 text-left"
          >
            {{ rows.length }} {{ rows.length === 1 ? 'task' : 'tasks' }}
          </th>
          <td class="px-4 py-3 text-right">
            {{ formatHours(totals.hours) }}
          </td>
          <td
            colspan="3"
            class="px-4 py-3"
          />
          <td class="px-4 py-3 text-right">
            {{ formatPrice(totals.cost) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
