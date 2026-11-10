import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, Switch, Text, TextInput, View } from 'react-native'
import { REFLECTION_WORDS, WALK_GOAL, useData } from './store'
import { styles } from './styles'

export function ProfileModal({ open, close }: { open: boolean; close: () => void }) {
  const { data, update, reset } = useData()

  const erase = () =>
    Alert.alert(
      'Erase all data?',
      'Tasks, journal entries, reflections, contacts and streaks will be deleted from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase everything',
          style: 'destructive',
          onPress: () => {
            reset()
            close()
          },
        },
      ],
    )

  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={close}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCenterShade}>
          <View style={styles.dialog}>
            <Text style={styles.h2}>Your settings</Text>

            <Text style={styles.fieldLabel}>What should we call you?</Text>
            <TextInput
              value={data.name}
              onChangeText={(name) => update((d) => ({ ...d, name }))}
              placeholder="Your name"
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
              maxLength={40}
            />

            <View style={[styles.rowBetween, { marginTop: 22, alignItems: 'center' }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.goalName}>Strict friction</Text>
                <Text style={styles.body}>
                  To override, write {REFLECTION_WORDS} words and walk {WALK_GOAL} steps.
                </Text>
              </View>
              <Switch
                value={data.strictGate}
                onValueChange={(strictGate) => update((d) => ({ ...d, strictGate }))}
                trackColor={{ false: '#CBD5E1', true: '#BEF264' }}
                thumbColor="#0F172A"
              />
            </View>

            <View style={styles.modalBottom}>
              <Pressable onPress={erase}>
                <Text style={styles.dangerLink}>Erase all data</Text>
              </Pressable>
              <Pressable onPress={close}>
                <Text style={styles.link}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
