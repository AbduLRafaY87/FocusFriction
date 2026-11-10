import { Activity, Check, ChevronRight, LockKeyhole, Moon, Play, Trophy, Zap } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { computeStreak, currentWeek, headerDate, todayStats, useData, type SprintTimer } from '../store'
import { ink, styles } from '../styles'
import { Action, Card, Heading } from '../ui'
import type { ViewName } from '../nav'

function heroTitle(lastMood: string | undefined, focusMinutes: number) {
  const hour = new Date().getHours()
  if (hour >= 23 || hour < 5) return "It's late. Rest is productive too."
  if (lastMood === 'Depleted') return 'Go gently today. One small step is plenty.'
  if (focusMinutes > 0) return `${focusMinutes} focused minutes so far. Nice work showing up.`
  return 'Make room for one meaningful sprint.'
}

export function Dashboard({ go, rescue, timer }: { go: (v: ViewName) => void; rescue: () => void; timer: SprintTimer }) {
  const { data, update } = useData()
  const stats = todayStats(data)
  const streak = computeStreak(data)
  const week = currentWeek(data)
  const lastMood = data.checkIns[data.checkIns.length - 1]?.mood
  const active = data.tasks.find((t) => t.id === data.activeTaskId)
  const nextStep = active?.steps.find((s) => !s.done)
  const open = data.tasks.filter((t) => t.steps.some((s) => !s.done)).slice(0, 4)
  const mmss = `${String(Math.floor(timer.seconds / 60)).padStart(2, '0')}:${String(timer.seconds % 60).padStart(2, '0')}`

  return (
    <>
      <Heading
        eyebrow={headerDate()}
        title="Make space for good focus."
        body="A calm command center for your CS week. Notice your energy, choose one next step, and protect your off-screen time."
      />

      {/* Pinned one-tap sprint, so the task chunker is never buried. */}
      <Card style={styles.pinned}>
        <Text style={styles.eyebrow}>{timer.running ? 'FOCUS IN PROGRESS' : 'NEXT 15-MINUTE STEP'}</Text>
        {nextStep && active ? (
          <>
            <Text style={styles.h2}>{timer.running ? mmss : nextStep.text}</Text>
            <Text style={styles.sub}>{active.title}</Text>
            <Action
              onPress={() => {
                if (!timer.running) timer.start(active.id)
                go('tasks')
              }}
            >
              <Play size={15} color={ink} />
              <Text style={styles.actionText}>{timer.running ? 'Open sprint' : 'Start 15-min task'}</Text>
            </Action>
          </>
        ) : (
          <>
            <Text style={styles.h2}>{active ? 'Every step is done. Add another task?' : 'Break one big task into small steps.'}</Text>
            <Action onPress={() => go('tasks')}>
              <Zap size={15} color={ink} />
              <Text style={styles.actionText}>{active ? 'New task' : 'Add a task'}</Text>
            </Action>
          </>
        )}
      </Card>

      <View style={styles.heroRow}>
        <Card dark style={styles.hero}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.darkEyebrow}>TODAY</Text>
              <Text style={styles.heroTitle}>{heroTitle(lastMood, stats.focusMinutes)}</Text>
            </View>
            <Activity color="#BEF264" size={23} />
          </View>
          <View style={styles.metrics}>
            {[
              [`${stats.focusMinutes}m`, 'Focused'],
              [String(stats.sprints), 'Sprints'],
              [String(stats.pauses), 'Pauses'],
            ].map(([value, label]) => (
              <View key={label}>
                <Text style={styles.metric}>{value}</Text>
                <Text style={styles.metricLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.row}>
            <Action onPress={rescue}>
              <LockKeyhole size={16} color={ink} />
              <Text style={styles.actionText}>Rescue me</Text>
            </Action>
            <Pressable onPress={() => go('bedtime')} style={styles.darkOutline}>
              <Moon size={16} color="white" />
              <Text style={styles.darkOutlineText}>Wind-down</Text>
            </Pressable>
          </View>
        </Card>

        <Card style={styles.streak}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.eyebrow}>FOCUS STREAK</Text>
              <Text style={styles.streakNumber}>
                {String(streak).padStart(2, '0')} <Text style={styles.streakSmall}>{streak === 1 ? 'day' : 'days'}</Text>
              </Text>
            </View>
            <Trophy color="#65A30D" size={22} />
          </View>
          <View style={styles.week}>
            {week.map((day, i) => (
              <View key={i} style={{ alignItems: 'center' }}>
                <View style={[styles.day, day.done && styles.dayDone, day.today && styles.dayToday]}>
                  {day.done ? <Check size={13} color={ink} /> : <Text style={styles.dot}>·</Text>}
                </View>
                <Text style={styles.dayLabel}>{day.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.quote}>Consistency is a kindness you keep giving your future self.</Text>
        </Card>
      </View>

      <View style={styles.sectionTitle}>
        <View>
          <Text style={styles.eyebrow}>ACTIVE GOALS</Text>
          <Text style={styles.h2}>Keep the next step visible</Text>
        </View>
        <Pressable onPress={() => go('tasks')}>
          <Text style={styles.link}>View tasks →</Text>
        </Pressable>
      </View>

      {open.length === 0 && <Text style={styles.empty}>No active goals yet. Add a task and it will show up here with its progress.</Text>}
      {open.map((task) => {
        const done = task.steps.filter((s) => s.done).length
        const progress = Math.round((done / task.steps.length) * 100)
        return (
          <Pressable
            key={task.id}
            onPress={() => {
              update((d) => ({ ...d, activeTaskId: task.id }))
              go('tasks')
            }}
            style={styles.goal}
          >
            <View style={styles.goalIcon}>
              <Zap size={17} color="#65A30D" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowBetween}>
                <Text style={[styles.goalName, { flex: 1 }]} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
              <Text style={styles.sub}>
                {done} of {task.steps.length} steps done
              </Text>
              <View style={styles.progress}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
            <ChevronRight size={18} color="#CBD5E1" />
          </Pressable>
        )
      })}
    </>
  )
}
