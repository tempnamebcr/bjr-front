<script setup lang="ts">
import type { AssignmentInput } from '#shared/types/assignment'
import { parseDataset, toJson } from '~/utils/dataset'

const props = defineProps<{
  /** The bundled sample: the editor's starting point and what "Reset" restores. */
  sample: AssignmentInput
  /** True while results for a custom dataset are shown. */
  isCustom: boolean
  pending: boolean
  /** Server-side errors (e.g. Laravel validation). */
  errors: string[]
}>()

const emit = defineEmits<{
  run: [dataset: AssignmentInput]
  reset: []
}>()

const employeesText = ref(toJson(props.sample.employees))
const tasksText = ref(toJson(props.sample.tasks))
const parseError = ref<string | null>(null)

const fields = [
  { key: 'employees', label: 'Employees', text: employeesText, example: '[{ "employeeId": 1, "skillLevel": 2, "hourlyRate": 100 }]' },
  { key: 'tasks', label: 'Tasks', text: tasksText, example: '[{ "taskId": 1, "skillLevel": 1, "estimation": 3 }]' },
] as const

async function loadFile(event: Event, target: typeof employeesText): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    target.value = await file.text()
    parseError.value = null
  }
}

function submit(): void {
  const parsed = parseDataset(employeesText.value, tasksText.value)
  parseError.value = parsed.ok ? null : parsed.error

  if (parsed.ok) {
    emit('run', parsed.dataset)
  }
}

function reset(): void {
  employeesText.value = toJson(props.sample.employees)
  tasksText.value = toJson(props.sample.tasks)
  parseError.value = null
  emit('reset')
}
</script>

<template>
  <details class="rounded-xl border border-slate-200 bg-white shadow-sm">
    <summary class="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-medium">
      <span>Edit or upload the dataset</span>
      <span
        class="rounded-full px-2.5 py-0.5 text-xs"
        :class="isCustom ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'"
      >
        {{ isCustom ? 'Showing a custom dataset' : 'Showing the sample dataset' }}
      </span>
    </summary>

    <form
      class="space-y-4 border-t border-slate-200 p-4"
      @submit.prevent="submit"
    >
      <div class="grid gap-4 lg:grid-cols-2">
        <div
          v-for="field in fields"
          :key="field.key"
          class="space-y-2"
        >
          <div class="flex items-center justify-between gap-2">
            <label
              :for="`dataset-${field.key}`"
              class="text-sm font-medium"
            >
              {{ field.label }} (JSON)
            </label>
            <label class="cursor-pointer text-xs text-sky-700 hover:underline">
              Upload .json
              <input
                type="file"
                accept="application/json,.json"
                class="sr-only"
                @change="loadFile($event, field.text)"
              >
            </label>
          </div>
          <textarea
            :id="`dataset-${field.key}`"
            v-model="field.text.value"
            rows="12"
            spellcheck="false"
            class="w-full rounded-md border border-slate-300 p-2 font-mono text-xs focus-visible:outline-2 focus-visible:outline-sky-600"
          />
          <p class="text-xs text-slate-500">
            e.g. <code>{{ field.example }}</code>
          </p>
        </div>
      </div>

      <div
        v-if="parseError || errors.length"
        role="alert"
        class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
      >
        <p class="font-medium">
          The dataset couldn't be solved:
        </p>
        <ul class="mt-1 list-inside list-disc space-y-0.5">
          <li v-if="parseError">
            {{ parseError }}
          </li>
          <li
            v-for="message in errors"
            :key="message"
          >
            {{ message }}
          </li>
        </ul>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          type="submit"
          :disabled="pending"
          class="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          {{ pending ? 'Optimizing…' : 'Run optimization' }}
        </button>
        <button
          type="button"
          class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          @click="reset"
        >
          Reset to sample data
        </button>
      </div>
    </form>
  </details>
</template>
