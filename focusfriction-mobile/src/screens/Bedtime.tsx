import { BedDouble, Check, Pause, PhoneCall, Play, Plus, X } from 'lucide-react-native'
import { useState } from 'react'
import { Linking, Pressable, Switch, Text, View } from 'react-native'
import { confirmCall } from '../call'
import { dayKey, uid, useData } from '../store'
import { ink, styles } from '../styles'
import { Card, ContactModal, Heading } from '../ui'

const ITEMS = ['Put phone across room', 'Turn off room lights', 'Set alarm without checking feeds']

export function Bedtime() {
  const { data, update } = useData()
  const [playing, setPlaying] = useState(false)
  const [adding, setAdding] = useState(false)

  const active = data.night.active
  const today = dayKey(new Date())
  // The checklist resets each day.
  const checked = data.night.day === today ? data.night.checked : [false, false, false]
  const hour = new Date().getHours()
  const lateNow = hour >= 23 || hour < 5
  const text = (extra?: object) => [styles.h2, active && { color: 'white' }, extra]

  const setActive = (v: boolean) => update((d) => ({ ...d, night: { ...d.night, active: v } }))
  const toggle = (i: number) =>
    update((d) => ({ ...d, night: { ...d.night, day: today, checked: checked.map((x, idx) => (idx === i ? !x : x)) } }))

  return (
    <View style={[styles.bedtime, active && styles.bedtimeActive]}>
      <Heading
        eyebrow="RANK 3 · PROTECT YOUR NIGHT"
        title="A softer landing for tomorrow."
        body={
          active
            ? 'Low light, low stimulation, and no need to make another decision tonight.'
            : lateNow
              ? "It's past 11:00 PM. A slower mode could help you land softly."
              : 'Bedtime Shield suggests a slower mode after 11:00 PM. You can practice it anytime.'
        }
      />
      <Card dark={active}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={active ? styles.darkEyebrow : styles.eyebrow}>LATE-NIGHT MODE</Text>
            <Text style={text()}>{active ? 'Gentle mode is active' : 'Start a calmer night'}</Text>
          </View>
          <Switch
            value={active}
            onValueChange={setActive}
            trackColor={{ false: '#CBD5E1', true: '#7DD3FC' }}
            thumbColor={active ? '#0F172A' : '#fff'}
          />
        </View>
        <View style={[styles.ambient, active && { backgroundColor: 'rgba(255,255,255,.06)' }]}>
          <Pressable onPress={() => setPlaying((p) => !p)} style={[styles.play, active && { backgroundColor: '#7DD3FC' }]}>
            {playing ? <Pause size={20} color={ink} /> : <Play size={20} color={active ? ink : 'white'} />}
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.goalName, active && { color: 'white' }]}>Rain on window</Text>
            <Text style={[styles.sub, active && { color: '#94A3B8' }]}>{playing ? 'Playing softly' : 'Ready when you are'}</Text>
          </View>
        </View>
      </Card>

      <Card dark={active} style={{ marginTop: 14 }}>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <BedDouble color="#059669" size={19} />
          </View>
          <View>
            <Text style={active ? styles.darkEyebrow : styles.eyebrow}>NON-DIGITAL WIND-DOWN</Text>
            <Text style={text()}>Three tiny signals</Text>
          </View>
        </View>
        {ITEMS.map((item, i) => (
          <Pressable key={item} onPress={() => toggle(i)} style={styles.checkRow}>
            <View style={[styles.checkbox, checked[i] && styles.checkboxDone]}>{checked[i] && <Check size={13} color={ink} />}</View>
            <Text style={[styles.stepText, active && { color: 'white' }, checked[i] && styles.strike]}>{item}</Text>
          </Pressable>
        ))}
      </Card>

      <Card dark={active} style={{ marginTop: 14 }}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={active ? styles.darkEyebrow : styles.eyebrow}>EMERGENCY CONTACTS</Text>
            <Text style={text()}>Never feel cut off</Text>
          </View>
          <Pressable onPress={() => setAdding(true)} hitSlop={10}>
            <Plus size={20} color={active ? '#BEF264' : '#4D7C0F'} />
          </Pressable>
        </View>
        <Text style={[styles.body, active && { color: '#94A3B8' }]}>
          Keep the people who must always reach you here. Then allow them in your phone's Do Not Disturb settings so their calls still ring
          at night.
        </Text>
        {data.emergency.map((c) => (
          <View key={c.id} style={styles.contactRow}>
            <Pressable style={[styles.row, { flex: 1 }]} onPress={() => confirmCall(c.name, c.phone)}>
              <PhoneCall size={16} color={active ? '#BEF264' : '#65A30D'} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.goalName, active && { color: 'white' }]}>{c.name}</Text>
                <Text style={[styles.sub, { marginTop: 2 }]}>{c.phone}</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => update((d) => ({ ...d, emergency: d.emergency.filter((x) => x.id !== c.id) }))} hitSlop={10}>
              <X size={15} color="#94A3B8" />
            </Pressable>
          </View>
        ))}
        <Pressable onPress={() => Linking.openSettings()}>
          <Text style={[styles.link, active && { color: '#BEF264' }]}>Open phone settings →</Text>
        </Pressable>
      </Card>

      <ContactModal
        visible={adding}
        title="Add an emergency contact"
        onClose={() => setAdding(false)}
        onSave={(c) => {
          update((d) => ({ ...d, emergency: [...d.emergency, { id: uid(), ...c }] }))
          setAdding(false)
        }}
      />
    </View>
  )
}
