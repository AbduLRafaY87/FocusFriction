export type Mood = 'Productive' | 'Relieved' | 'Neutral' | 'Depleted'

export type Step = { id: string; text: string; done: boolean; doneAt?: number }
export type Task = {
  id: string
  title: string
  steps: Step[]
  createdAt: number
  /** 'ai' = Gemini breakdown, 'local' = offline fallback template */
  source: 'ai' | 'local'
}

export type Sprint = { id: string; taskId: string | null; minutes: number; at: number }
export type CheckIn = { id: string; at: number; mood: Mood }

export type GatePathway = 'reflect' | 'logic' | 'steps' | 'breathe' | 'strict'
export type GateEvent = { id: string; at: number; pathway: GatePathway; reflection?: string }

export type JournalEntry = { id: string; at: number; text: string }

export type SupportSlot = 'counseling' | 'helpline' | 'faculty'
export type Contact = { name: string; phone: string }
export type EmergencyContact = Contact & { id: string }

export type TimerState = { taskId: string | null; remaining: number; endAt: number | null }

export type AppData = {
  version: 1
  name: string
  /** Strict friction: reflection AND 200 steps are both required to override. */
  strictGate: boolean
  tasks: Task[]
  activeTaskId: string | null
  sprints: Sprint[]
  checkIns: CheckIn[]
  gates: GateEvent[]
  journal: JournalEntry[]
  support: Partial<Record<SupportSlot, Contact>>
  emergency: EmergencyContact[]
  night: { active: boolean; day: string; checked: boolean[] }
  timer: TimerState
}
