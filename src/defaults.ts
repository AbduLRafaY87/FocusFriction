import type { AppData } from './types'

export const SPRINT_SECONDS = 15 * 60

export const emptyData = (): AppData => ({
  version: 1,
  name: '',
  strictGate: false,
  tasks: [],
  activeTaskId: null,
  sprints: [],
  checkIns: [],
  gates: [],
  journal: [],
  support: {},
  emergency: [],
  night: { active: false, day: '', checked: [false, false, false] },
  timer: { taskId: null, remaining: SPRINT_SECONDS, endAt: null },
})
