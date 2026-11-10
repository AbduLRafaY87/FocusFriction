import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { SPRINT_SECONDS, emptyData } from './defaults'
import type { AppData } from './types'

export { SPRINT_SECONDS, emptyData }

const KEY = 'focusfriction:data:v1'
const BACKUP_KEY = 'focusfriction:data:v1:unreadable'
export const WALK_GOAL = 200
export const REFLECTION_WORDS = 30
const MAX_LOG = 500

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

/** Keep the logs from growing forever. */
function trim(d: AppData): AppData {
  return {
    ...d,
    sprints: d.sprints.slice(-MAX_LOG),
    checkIns: d.checkIns.slice(-MAX_LOG),
    gates: d.gates.slice(-MAX_LOG),
    journal: d.journal.slice(-MAX_LOG),
  }
}

type Ctx = {
  data: AppData
  ready: boolean
  update: (fn: (d: AppData) => AppData) => void
  reset: () => void
}
const DataContext = createContext<Ctx | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData)
  const [ready, setReady] = useState(false)
  // If we couldn't READ saved data, never WRITE over it with an empty state.
  const [canSave, setCanSave] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY)
        if (raw && alive) {
          try {
            setData({ ...emptyData(), ...JSON.parse(raw) })
          } catch {
            // Never silently destroy data we couldn't parse: keep a copy.
            await AsyncStorage.setItem(BACKUP_KEY, raw)
          }
        }
        if (alive) setCanSave(true)
      } catch (e) {
        console.warn('Could not read saved data', e)
      } finally {
        if (alive) setReady(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!ready || !canSave) return
    AsyncStorage.setItem(KEY, JSON.stringify(data)).catch((e) => console.warn('Could not save data', e))
  }, [data, ready, canSave])

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => trim(fn(d))), [])
  const reset = useCallback(() => setData(emptyData()), [])

  return <DataContext.Provider value={{ data, ready, update, reset }}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}

export * from './stats'

/* ---------- 15-minute sprint timer (survives backgrounding & restarts) ---------- */

export type SprintTimer = {
  seconds: number
  running: boolean
  untouched: boolean
  start: (taskId: string | null) => void
  pause: () => void
  reset: () => void
}

export function useSprintTimer(): SprintTimer {
  const { data, update, ready } = useData()
  const { endAt, remaining } = data.timer
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!ready || endAt === null) return
    const tick = () => {
      const t = Date.now()
      if (t >= endAt) {
        update((d) =>
          d.timer.endAt === null || Date.now() < d.timer.endAt
            ? d
            : {
                ...d,
                sprints: [...d.sprints, { id: uid(), taskId: d.timer.taskId, minutes: SPRINT_SECONDS / 60, at: d.timer.endAt }],
                timer: { taskId: d.timer.taskId, remaining: SPRINT_SECONDS, endAt: null },
              },
        )
      } else setNow(t)
    }
    tick()
    const h = setInterval(tick, 1000)
    return () => clearInterval(h)
  }, [ready, endAt, update])

  const seconds = endAt === null ? remaining : Math.max(0, Math.ceil((endAt - now) / 1000))

  return {
    seconds,
    running: endAt !== null,
    untouched: endAt === null && remaining === SPRINT_SECONDS,
    start: (taskId) => {
      setNow(Date.now())
      update((d) =>
        d.timer.endAt !== null
          ? d
          : { ...d, timer: { taskId, remaining: d.timer.remaining, endAt: Date.now() + d.timer.remaining * 1000 } },
      )
    },
    pause: () =>
      update((d) =>
        d.timer.endAt === null
          ? d
          : { ...d, timer: { ...d.timer, remaining: Math.max(1, Math.ceil((d.timer.endAt - Date.now()) / 1000)), endAt: null } },
      ),
    reset: () => update((d) => ({ ...d, timer: { taskId: d.timer.taskId, remaining: SPRINT_SECONDS, endAt: null } })),
  }
}
