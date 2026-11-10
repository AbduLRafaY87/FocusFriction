import { X } from 'lucide-react-native'
import { useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { dayKey, friendlyDate, uid, useData } from '../store'
import { styles } from '../styles'
import { Action, Card, Heading } from '../ui'

const TEMPLATES = [
  'Solved 2 LeetCode problems today',
  'Fixed a tricky bug',
  'Finished a lecture or reading',
  'Pushed code to GitHub',
  'Learned a new concept',
  'Built a feature for my project',
]

export function Journal() {
  const { data, update } = useData()
  const [text, setText] = useState('')
  const entries = [...data.journal].reverse().slice(0, 50)
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000
  const thisWeek = data.journal.filter((j) => j.at >= weekAgo).length
  const valid = text.trim().length > 0

  const save = () => {
    if (!valid) return
    update((d) => ({ ...d, journal: [...d.journal, { id: uid(), at: Date.now(), text: text.trim() }] }))
    setText('')
  }

  const remove = (id: string) =>
    Alert.alert('Delete this entry?', 'It will be removed from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => update((d) => ({ ...d, journal: d.journal.filter((j) => j.id !== id) })) },
    ])

  return (
    <>
      <Heading
        eyebrow="SKILL PROGRESS JOURNAL"
        title="Notice what you have built."
        body="A private log of what you learned and shipped. No feeds, no comparison, just your own progress."
      />

      <Card>
        <Text style={styles.eyebrow}>TODAY I…</Text>
        <TextInput
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Tap a template or write your own..."
          placeholderTextColor="#94A3B8"
          style={[styles.textarea, { minHeight: 80 }]}
        />
        <View style={styles.chips}>
          {TEMPLATES.map((t) => (
            <Pressable key={t} onPress={() => setText((prev) => (prev.trim() ? `${prev.trim()}\n${t}` : t))} style={styles.chip}>
              <Text style={styles.chipText}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <Action onPress={save} disabled={!valid} dark={!valid}>
          <Text style={[styles.actionText, !valid && { color: '#94A3B8' }]}>Save entry</Text>
        </Action>
      </Card>

      <View style={styles.sectionTitle}>
        <View>
          <Text style={styles.eyebrow}>YOUR LOG</Text>
          <Text style={styles.h2}>
            {data.journal.length === 0 ? 'Nothing yet' : `${thisWeek} this week · ${data.journal.length} total`}
          </Text>
        </View>
      </View>

      {entries.length === 0 && <Text style={styles.empty}>Your first entry will show up here. Small wins count.</Text>}
      {entries.map((entry, i) => {
        const prev = entries[i - 1]
        const showDate = !prev || dayKey(prev.at) !== dayKey(entry.at)
        return (
          <View key={entry.id} style={styles.entry}>
            <View style={styles.rowBetween}>
              <Text style={styles.eyebrow}>
                {showDate
                  ? friendlyDate(entry.at).toUpperCase()
                  : new Date(entry.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </Text>
              <Pressable onPress={() => remove(entry.id)} hitSlop={10}>
                <X size={15} color="#94A3B8" />
              </Pressable>
            </View>
            <Text style={styles.entryText}>{entry.text}</Text>
          </View>
        )
      })}
    </>
  )
}
