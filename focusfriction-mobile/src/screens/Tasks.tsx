import { BrainCircuit, Check, Coffee, Sparkles, Timer, Trash2 } from 'lucide-react-native'
import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native'
import { deconstructTask } from '../ai'
import type { ViewName } from '../nav'
import { dayKey, uid, useData, type SprintTimer } from '../store'
import { ink, muted, styles } from '../styles'
import type { Mood, Task } from '../types'
import { Action, Card, Heading, Pill } from '../ui'

const MOODS: Mood[] = ['Productive', 'Relieved', 'Neutral', 'Depleted']
const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six']

export function Tasks({ go, timer }: { go: (v: ViewName) => void; timer: SprintTimer }) {
  const { data, update } = useData()
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  const task = data.tasks.find((t) => t.id === data.activeTaskId) ?? null
  const others = data.tasks.filter((t) => t.id !== task?.id)
  const count = task?.steps.length ?? 4
  const done = task?.steps.filter((s) => s.done).length ?? 0
  const mmss = `${String(Math.floor(timer.seconds / 60)).padStart(2, '0')}:${String(timer.seconds % 60).padStart(2, '0')}`

  const lastCheckIn = data.checkIns[data.checkIns.length - 1]
  const mood = lastCheckIn && dayKey(lastCheckIn.at) === dayKey(new Date()) ? lastCheckIn.mood : ''

  const deconstruct = async () => {
    const text = title.trim()
    if (!text || busy) return
    setBusy(true)
    setNote('')
    const result = await deconstructTask(text)
    const created: Task = {
      id: uid(),
      title: text,
      steps: result.steps.map((s) => ({ id: uid(), text: s, done: false })),
      createdAt: Date.now(),
      source: result.source,
    }
    update((d) => ({ ...d, tasks: [created, ...d.tasks], activeTaskId: created.id }))
    setTitle('')
    setNote(result.note ?? '')
    setBusy(false)
  }

  const toggleStep = (stepId: string) =>
    update((d) => ({
      ...d,
      tasks: d.tasks.map((t) =>
        t.id !== task?.id
          ? t
          : { ...t, steps: t.steps.map((s) => (s.id !== stepId ? s : { ...s, done: !s.done, doneAt: s.done ? undefined : Date.now() })) },
      ),
    }))

  const removeTask = () => {
    if (!task) return
    Alert.alert('Delete this task?', `"${task.title}" and its steps will be removed from this device.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          update((d) => {
            const rest = d.tasks.filter((t) => t.id !== task.id)
            return { ...d, tasks: rest, activeTaskId: rest[0]?.id ?? null }
          }),
      },
    ])
  }

  const checkIn = (m: Mood) =>
    update((d) => {
      const last = d.checkIns[d.checkIns.length - 1]
      const entry = { id: uid(), at: Date.now(), mood: m }
      // Re-tapping within two minutes corrects the last answer instead of adding a duplicate.
      return last && Date.now() - last.at < 120000
        ? { ...d, checkIns: [...d.checkIns.slice(0, -1), entry] }
        : { ...d, checkIns: [...d.checkIns, entry] }
    })

  return (
    <>
      <Heading
        eyebrow="RANK 2 · MAKE IT SMALLER"
        title={`One task. ${WORDS[count] ?? count} next steps.`}
        body="Turn an intimidating assignment into a sequence your brain can actually begin."
      />

      <Card>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <BrainCircuit color="#7C3AED" size={19} />
          </View>
          <View>
            <Text style={styles.eyebrow}>ASSIGNMENT INPUT</Text>
            <Text style={styles.h2}>What feels big right now?</Text>
          </View>
        </View>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Build the login controller for my web app"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          editable={!busy}
          returnKeyType="done"
          onSubmitEditing={deconstruct}
        />
        <Action onPress={deconstruct} disabled={busy || !title.trim()} dark={busy || !title.trim()}>
          {busy ? <ActivityIndicator size="small" color={ink} /> : <Sparkles size={16} color={title.trim() ? ink : '#94A3B8'} />}
          <Text style={[styles.actionText, !title.trim() && { color: '#94A3B8' }]}>
            {busy ? 'Breaking it down…' : 'Deconstruct this task'}
          </Text>
        </Action>
        {!!note && <Text style={styles.note}>{note}</Text>}
      </Card>

      {others.length > 0 && (
        <View style={styles.chips}>
          {others.map((t) => (
            <Pressable key={t.id} onPress={() => update((d) => ({ ...d, activeTaskId: t.id }))} style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>
                {t.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Card style={{ marginTop: 14 }}>
        {task ? (
          <>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Pill color={task.source === 'ai' ? '#D1FAE5' : '#F1F5F9'} text={task.source === 'ai' ? '#047857' : muted}>
                  {task.source === 'ai' ? 'AI MICRO-CHUNKING' : 'STEP-BY-STEP BREAKDOWN'}
                </Pill>
                <Text style={[styles.h2, { marginTop: 10 }]} numberOfLines={2}>
                  {task.title}
                </Text>
                <Text style={styles.sub}>
                  {done} of {task.steps.length} done
                </Text>
              </View>
              <View>
                <Text style={styles.timer}>{mmss}</Text>
                <Text style={styles.eyebrow}>FOCUS TIMER</Text>
              </View>
            </View>

            {task.steps.map((step, i) => (
              <Pressable key={step.id} onPress={() => toggleStep(step.id)} style={[styles.step, step.done && styles.stepDone]}>
                <View style={[styles.checkbox, step.done && styles.checkboxDone]}>{step.done && <Check size={13} color={ink} />}</View>
                <Text style={[styles.stepText, step.done && styles.strike]}>
                  {String(i + 1).padStart(2, '0')} {step.text}
                </Text>
              </Pressable>
            ))}

            <View style={styles.row}>
              <Action onPress={() => (timer.running ? timer.pause() : timer.start(task.id))}>
                <Timer size={16} color={ink} />
                <Text style={styles.actionText}>
                  {timer.running ? 'Pause focus' : timer.untouched ? 'Start 15-min focus' : 'Resume focus'}
                </Text>
              </Action>
              <Pressable onPress={() => go('locker')} style={styles.outline}>
                <Coffee size={16} color="#F59E0B" />
                <Text style={styles.outlineText}>Mindful break</Text>
              </Pressable>
            </View>

            <View style={[styles.rowBetween, { marginTop: 16, alignItems: 'center' }]}>
              {!timer.running && !timer.untouched ? (
                <Pressable onPress={timer.reset}>
                  <Text style={styles.smallLink}>Reset timer</Text>
                </Pressable>
              ) : (
                <View />
              )}
              <Pressable onPress={removeTask} style={styles.row}>
                <Trash2 size={13} color="#BE123C" />
                <Text style={styles.dangerLink}>Delete task</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Pill color="#F1F5F9" text={muted}>
              YOUR RUNWAY
            </Pill>
            <Text style={styles.empty}>
              Describe something that feels big above and it will be broken into small steps you can start right now.
            </Text>
          </>
        )}
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={styles.eyebrow}>AFTER YOUR SPRINT</Text>
        <Text style={styles.h2}>How do you feel now?</Text>
        <Text style={styles.body}>No productivity score. Just useful information.</Text>
        <View style={styles.emotions}>
          {MOODS.map((label) => (
            <Pressable key={label} onPress={() => checkIn(label)} style={[styles.emotion, mood === label && styles.emotionActive]}>
              <Text style={styles.emotionText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>
    </>
  )
}
