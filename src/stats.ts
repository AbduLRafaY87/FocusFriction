import type { AppData } from './types'

const pad = (n: number) => String(n).padStart(2, '0')
export const dayKey = (ts: number | Date) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const shiftDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/** A day counts toward the streak if the student did any real work that day. */
export function activityDays(d: AppData): Set<string> {
  const days = new Set<string>()
  d.sprints.forEach((s) => days.add(dayKey(s.at)))
  d.journal.forEach((j) => days.add(dayKey(j.at)))
  d.tasks.forEach((t) => t.steps.forEach((s) => s.doneAt && days.add(dayKey(s.doneAt))))
  return days
}

export function computeStreak(d: AppData): number {
  const days = activityDays(d)
  let cursor = new Date()
  // Today isn't over yet, so an empty today doesn't break the streak.
  if (!days.has(dayKey(cursor))) cursor = shiftDays(cursor, -1)
  let n = 0
  while (days.has(dayKey(cursor))) {
    n++
    cursor = shiftDays(cursor, -1)
  }
  return n
}

/** Monday-first week containing today: [{ label, done, today }] */
export function currentWeek(d: AppData) {
  const days = activityDays(d)
  const now = new Date()
  const monday = shiftDays(now, -((now.getDay() + 6) % 7))
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => {
    const day = shiftDays(monday, i)
    return { label, done: days.has(dayKey(day)), today: dayKey(day) === dayKey(now) }
  })
}

export function todayStats(d: AppData) {
  const today = dayKey(new Date())
  const sprints = d.sprints.filter((s) => dayKey(s.at) === today)
  return {
    focusMinutes: sprints.reduce((sum, s) => sum + s.minutes, 0),
    sprints: sprints.length,
    pauses: d.gates.filter((g) => dayKey(g.at) === today).length,
  }
}

export function friendlyDate(ts: number) {
  const key = dayKey(ts)
  if (key === dayKey(new Date())) return 'Today'
  if (key === dayKey(shiftDays(new Date(), -1))) return 'Yesterday'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function headerDate() {
  const now = new Date()
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' })
  const rest = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${weekday} · ${rest}`.toUpperCase()
}
