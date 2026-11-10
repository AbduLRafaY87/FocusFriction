import { Pedometer } from 'expo-sensors'
import { Check, Footprints, Pause, Play, ShieldCheck, X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native'
import { REFLECTION_WORDS, WALK_GOAL, useData, uid } from './store'
import { ink, muted, styles } from './styles'
import type { GatePathway } from './types'
import { Action, Pill } from './ui'

type Tab = 'reflect' | 'logic' | 'steps' | 'breathe'

const LOGIC: { q: string; a: string }[] = [
  { q: 'A recursive function doubles its input, starting at 1. What is the output after 3 calls?', a: '8' },
  { q: 'How many bits do you need to store the decimal number 255 as an unsigned integer?', a: '8' },
  { q: 'What is binary 1011 in decimal?', a: '11' },
  { q: 'What is 2 to the power of 5?', a: '32' },
  { q: 'What does 17 % 5 evaluate to?', a: '2' },
  { q: 'How many times does the body of for (i = 0; i < 6; i++) run?', a: '6' },
  { q: 'A full binary tree has a root and two full levels below it. How many nodes in total?', a: '7' },
]

/** Counts steps while `enabled`. Permission is only requested once enabled. */
function useStepCounter(enabled: boolean) {
  const [steps, setSteps] = useState(0)
  const [status, setStatus] = useState<'idle' | 'ok' | 'unavailable' | 'denied'>('idle')
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let sub: { remove: () => void } | undefined
    ;(async () => {
      try {
        if (!(await Pedometer.isAvailableAsync())) return !cancelled && setStatus('unavailable')
        const perm = await Pedometer.requestPermissionsAsync()
        if (!perm.granted) return !cancelled && setStatus('denied')
        if (cancelled) return
        setStatus('ok')
        sub = Pedometer.watchStepCount((r) => setSteps(r.steps))
      } catch {
        if (!cancelled) setStatus('unavailable')
      }
    })()
    return () => {
      cancelled = true
      sub?.remove()
    }
  }, [enabled])
  return { steps, status }
}

function GateBody({ close, strict }: { close: () => void; strict: boolean }) {
  const { update } = useData()
  const [tab, setTab] = useState<Tab>('reflect')
  const [visitedWalk, setVisitedWalk] = useState(false)
  const [text, setText] = useState('')
  const [answer, setAnswer] = useState('')
  const [question] = useState(() => LOGIC[Math.floor(Math.random() * LOGIC.length)])
  const [seconds, setSeconds] = useState(60)
  const [running, setRunning] = useState(false)
  const { steps, status } = useStepCounter(strict || visitedWalk)

  useEffect(() => {
    if (!running || seconds === 0) return
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [running, seconds])

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const wordsOk = words >= REFLECTION_WORDS
  const logicOk = answer.trim() === question.a
  const stepsOk = steps >= WALK_GOAL
  const breatheOk = seconds === 0
  // If the phone can't count steps, strict mode falls back to reflection only rather than locking the student out.
  const stepsUnavailable = status === 'unavailable' || status === 'denied'
  const unlocked = strict ? wordsOk && (stepsOk || stepsUnavailable) : wordsOk || logicOk || stepsOk || breatheOk

  const finish = () => {
    if (!unlocked) return
    const pathway: GatePathway = strict ? 'strict' : wordsOk ? 'reflect' : logicOk ? 'logic' : stepsOk ? 'steps' : 'breathe'
    const reflection = wordsOk ? text.trim() : undefined
    update((d) => ({ ...d, gates: [...d.gates, { id: uid(), at: Date.now(), pathway, reflection }] }))
    close()
  }

  const pick = (id: Tab) => {
    setTab(id)
    if (id === 'steps') setVisitedWalk(true)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.modalShade}>
        <View style={styles.modal}>
          <View style={styles.rowBetween}>
            <View>
              <Pill color="#FFE4E6" text="#BE123C">
                FRICTION GATE
              </Pill>
              <Text style={styles.h2}>Pause before you override.</Text>
            </View>
            <Pressable onPress={close}>
              <X color={muted} size={22} />
            </Pressable>
          </View>
          <Text style={styles.body}>
            {strict
              ? `Strict mode: write ${REFLECTION_WORDS} words and walk ${WALK_GOAL} steps to continue.`
              : 'Soft timers fail when willpower is low. Complete any one pathway to proceed.'}
          </Text>

          <View style={styles.tabs}>
            {(
              [
                ['reflect', 'Reflect'],
                ['logic', 'CS logic'],
                ['steps', 'Walk'],
                ['breathe', 'Breathe'],
              ] as [Tab, string][]
            ).map(([id, label]) => (
              <Pressable key={id} onPress={() => pick(id)} style={[styles.tab, tab === id && styles.tabActive]}>
                <Text style={[styles.tabText, tab === id && styles.tabTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {tab === 'reflect' && (
            <>
              <Text style={styles.label}>Why do I need to scroll right now? How will I feel at Maghrib if I lose 2 hours?</Text>
              <TextInput
                multiline
                value={text}
                onChangeText={setText}
                placeholder="Write the honest version..."
                placeholderTextColor="#94A3B8"
                style={styles.textarea}
              />
              <Text style={styles.counter}>
                {words}/{REFLECTION_WORDS} words
              </Text>
            </>
          )}

          {tab === 'logic' && (
            <View style={styles.logic}>
              <Text style={styles.darkEyebrow}>QUICK BINARY CHECK</Text>
              <Text style={styles.logicText}>{question.q}</Text>
              <TextInput
                keyboardType="number-pad"
                value={answer}
                onChangeText={setAnswer}
                placeholder="Your answer"
                placeholderTextColor="#94A3B8"
                style={styles.darkInput}
              />
            </View>
          )}

          {tab === 'steps' && (
            <View style={styles.breathe}>
              <Footprints size={26} color="#075985" />
              <Text style={styles.breatheNumber}>
                {steps}/{WALK_GOAL}
              </Text>
              <Text style={styles.breatheTitle}>Take your phone for a walk.</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${Math.min(100, (steps / WALK_GOAL) * 100)}%` }]} />
              </View>
              <Text style={styles.gateStatus}>
                {status === 'unavailable'
                  ? 'Step counting is not available on this device.'
                  : status === 'denied'
                    ? 'Motion permission was denied. Enable it in settings to use this pathway.'
                    : status === 'idle'
                      ? 'Starting step counter…'
                      : 'Walk with the phone in your hand or pocket.'}
              </Text>
            </View>
          )}

          {tab === 'breathe' && (
            <View style={styles.breathe}>
              <Text style={styles.breatheNumber}>{seconds}s</Text>
              <Text style={styles.breatheTitle}>In for four. Out for six.</Text>
              <Text style={styles.body}>Let your nervous system have a vote.</Text>
              <Action onPress={() => setRunning((r) => !r)}>
                {running ? <Pause size={16} color={ink} /> : <Play size={16} color={ink} />}
                <Text style={styles.actionText}>{running ? 'Pause timer' : 'Begin breathing'}</Text>
              </Action>
            </View>
          )}

          {strict && (
            <Text style={styles.gateStatus}>
              {wordsOk ? '✓' : '○'} Reflection {stepsOk || stepsUnavailable ? '✓' : '○'} Walk
              {stepsUnavailable ? ' (skipped: no step sensor)' : ''}
            </Text>
          )}

          <View style={styles.modalBottom}>
            <View style={styles.row}>
              <ShieldCheck size={16} color="#10B981" />
              <Text style={styles.private}>No shame. No surveillance.</Text>
            </View>
            <Action onPress={finish} disabled={!unlocked} dark={!unlocked}>
              {unlocked && <Check size={14} color={ink} />}
              <Text style={[styles.actionText, !unlocked && { color: '#94A3B8' }]}>
                {unlocked ? 'Continue mindfully' : 'Complete one pathway'}
              </Text>
            </Action>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export function FrictionModal({ open, close }: { open: boolean; close: () => void }) {
  const { data } = useData()
  return (
    <Modal animationType="slide" transparent visible={open} onRequestClose={close}>
      {/* Mounted only while open, so every visit starts fresh. */}
      {open ? <GateBody close={close} strict={data.strictGate} /> : null}
    </Modal>
  )
}
