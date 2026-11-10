import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  HeartHandshake,
  Home,
  LockKeyhole,
  MessageCircleHeart,
  Moon,
  User,
} from 'lucide-react-native'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FrictionModal } from './src/FrictionModal'
import type { ViewName } from './src/nav'
import { ProfileModal } from './src/ProfileModal'
import { Bedtime } from './src/screens/Bedtime'
import { Dashboard } from './src/screens/Dashboard'
import { Journal } from './src/screens/Journal'
import { Support } from './src/screens/Support'
import { Tasks } from './src/screens/Tasks'
import { DataProvider, useData, useSprintTimer } from './src/store'
import { ink, styles } from './src/styles'
import { Action, Card, Heading } from './src/ui'

const nav = [
  { id: 'dashboard' as ViewName, label: 'Home', icon: Home },
  { id: 'locker' as ViewName, label: 'Pause', icon: LockKeyhole },
  { id: 'tasks' as ViewName, label: 'Tasks', icon: BrainCircuit },
  { id: 'journal' as ViewName, label: 'Journal', icon: BookOpen },
  { id: 'bedtime' as ViewName, label: 'Night', icon: Moon },
  { id: 'support' as ViewName, label: 'Support', icon: HeartHandshake },
]

function Shell() {
  const { data, ready } = useData()
  const timer = useSprintTimer()
  const [view, setView] = useState<ViewName>('dashboard')
  const [gate, setGate] = useState(false)
  const [profile, setProfile] = useState(false)

  if (!ready) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color="#65A30D" />
      </SafeAreaView>
    )
  }

  const initials =
    data.name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || ''

  const content =
    view === 'dashboard' ? (
      <Dashboard go={setView} rescue={() => setGate(true)} timer={timer} />
    ) : view === 'locker' ? (
      <>
        <Heading
          eyebrow="RANK 1 · CORE FEATURE"
          title="The pause before the pull."
          body="A high-friction space for the moments when a soft timer is not enough."
        />
        <Card style={styles.center}>
          <View style={styles.bigIcon}>
            <LockKeyhole color="#65A30D" size={28} />
          </View>
          <Text style={styles.h2}>Ready to meet the urge?</Text>
          <Text style={styles.body}>
            {data.strictGate
              ? 'Strict mode is on: a reflection and a walk.'
              : 'Choose a reflection, logic check, short walk, or minute of breathing.'}
          </Text>
          <Action onPress={() => setGate(true)}>
            <Text style={styles.actionText}>Open friction gate</Text>
            <ArrowRight size={16} color={ink} />
          </Action>
        </Card>
      </>
    ) : view === 'tasks' ? (
      <Tasks go={setView} timer={timer} />
    ) : view === 'journal' ? (
      <Journal />
    ) : view === 'bedtime' ? (
      <Bedtime />
    ) : (
      <Support />
    )

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.top}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Image
              source={require('./assets/focusfriction-icon.png')}
              style={styles.brandImage}
              accessibilityLabel="FocusFriction logo"
            />
          </View>
          <View>
            <Text style={styles.brandName}>FocusFriction</Text>
            <Text style={styles.brandSub}>CS WELL-BEING</Text>
          </View>
        </View>
        <Pressable onPress={() => setProfile(true)} style={styles.avatar} accessibilityLabel="Open settings">
          {initials ? <Text style={styles.avatarText}>{initials}</Text> : <User size={16} color="#64748B" />}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {content}
        <Text style={styles.footer}>Built for calmer computer science days</Text>
      </ScrollView>

      <View style={styles.bottomNav}>
        {nav.map(({ id, label, icon: Icon }) => (
          <Pressable key={id} onPress={() => setView(id)} style={styles.navItem}>
            <Icon size={20} color={view === id ? '#65A30D' : '#94A3B8'} />
            <Text style={[styles.navLabel, view === id && styles.navLabelActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => setView('support')} style={styles.fab}>
        <MessageCircleHeart size={18} color="#FDA4AF" />
        <Text style={styles.fabText}>Talk to a Person</Text>
      </Pressable>

      <FrictionModal open={gate} close={() => setGate(false)} />
      <ProfileModal open={profile} close={() => setProfile(false)} />
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  )
}
