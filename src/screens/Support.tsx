import { CheckCircle2, ShieldCheck, UsersRound } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { confirmCall } from '../call'
import { useData } from '../store'
import { styles } from '../styles'
import type { SupportSlot } from '../types'
import { Card, ContactModal, Heading } from '../ui'

const SLOTS: { id: SupportSlot; title: string; detail: string; empty: string }[] = [
  {
    id: 'counseling',
    title: 'GU Tech Campus Counseling',
    detail: 'Confidential campus counseling and appointment scheduling.',
    empty: 'Add counseling number',
  },
  {
    id: 'helpline',
    title: 'Mental Health Helpline',
    detail: 'Talk to a trained counselor. Save the helpline for your country so it is one tap away.',
    empty: 'Add helpline number',
  },
  {
    id: 'faculty',
    title: 'Faculty & academic advisors',
    detail: 'A trusted person for course pressure or academic support.',
    empty: 'Add a trusted person',
  },
]

export function Support() {
  const { data, update } = useData()
  const [editing, setEditing] = useState<SupportSlot | null>(null)
  const slot = SLOTS.find((s) => s.id === editing)

  return (
    <>
      <Heading
        eyebrow="YOU DO NOT HAVE TO HOLD IT ALONE"
        title="Human support, without the paperwork."
        body="If this moment feels bigger than an app, it is okay to reach for a person."
      />
      {SLOTS.map((s) => {
        const contact = data.support[s.id]
        return (
          <Card key={s.id} style={{ marginBottom: 12 }}>
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <UsersRound color="#E11D48" size={19} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.h2}>{s.title}</Text>
                <Text style={styles.body}>{s.detail}</Text>
                <View style={[styles.rowBetween, { alignItems: 'center' }]}>
                  <Pressable onPress={() => (contact ? confirmCall(contact.name, contact.phone) : setEditing(s.id))}>
                    <Text style={styles.link}>{contact ? `Call ${contact.name}  →` : `${s.empty}  →`}</Text>
                  </Pressable>
                  {contact && (
                    <Pressable onPress={() => setEditing(s.id)} style={{ marginTop: 13 }}>
                      <Text style={styles.smallLink}>Edit</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          </Card>
        )
      })}

      <Card dark style={{ marginTop: 4 }}>
        <View style={styles.row}>
          <ShieldCheck color="#BEF264" size={19} />
          <Text style={[styles.h2, { color: 'white', marginLeft: 10 }]}>Safety by design</Text>
        </View>
        {[
          'Zero surveillance: No staff, parent, or institution tracking.',
          'Zero shaming: No failure counters or negative scoring.',
          'Your reflections and logs stay on this device only.',
        ].map((item) => (
          <View key={item} style={styles.safetyRow}>
            <CheckCircle2 color="#34D399" size={17} />
            <Text style={styles.safetyText}>{item}</Text>
          </View>
        ))}
      </Card>

      <ContactModal
        visible={editing !== null}
        title={slot?.title ?? ''}
        initial={editing ? data.support[editing] : undefined}
        onClose={() => setEditing(null)}
        onSave={(c) => {
          if (editing) update((d) => ({ ...d, support: { ...d.support, [editing]: c } }))
          setEditing(null)
        }}
        onDelete={() => {
          if (editing)
            update((d) => {
              const support = { ...d.support }
              delete support[editing]
              return { ...d, support }
            })
          setEditing(null)
        }}
      />
    </>
  )
}
