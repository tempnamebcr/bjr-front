<script setup lang="ts">
/** `null` = all employees. */
const selected = defineModel<number | null>({ required: true })

defineProps<{
  /** Employees with work in the current variant. */
  options: number[]
}>()

const id = useId()
</script>

<template>
  <div class="flex items-center gap-2">
    <label
      :for="id"
      class="text-sm text-slate-600"
    >
      Employee
    </label>
    <select
      :id="id"
      v-model="selected"
      class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-sky-600"
    >
      <option :value="null">
        All employees
      </option>
      <option
        v-for="employeeId in options"
        :key="employeeId"
        :value="employeeId"
      >
        Employee {{ employeeId }}
      </option>
    </select>
  </div>
</template>
