import { useEffect, useState, type ReactNode } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native'
import { styles } from './styles'
import type { Contact } from './types'

export function Pill({ children, color = '#ECFCCB', text = '#3F6212' }: { children: ReactNode; color?: string; text?: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <Text style={[styles.pillText, { color: text }]}>{children}</Text>
    </View>
  )
}

export function Card({ children, dark = false, style }: { children: ReactNode; dark?: boolean; style?: object }) {
  return <View style={[styles.card, dark && styles.darkCard, style]}>{children}</View>
}

export function Heading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <View style={styles.heading}>
      <Pill>{eyebrow}</Pill>
      <Text style={styles.h1}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  )
}

export function Action({
  children,
  onPress,
  dark = false,
  disabled = false,
}: {
  children: ReactNode
  onPress: () => void
  dark?: boolean
  disabled?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.action, dark ? styles.actionDark : styles.actionLime, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  )
}

/** Add / edit a single phone contact. Used for support numbers and the emergency whitelist. */
export function ContactModal({
  visible,
  title,
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  visible: boolean
  title: string
  initial?: Contact
  onSave: (c: Contact) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '')
      setPhone(initial?.phone ?? '')
    }
  }, [visible, initial])
  const valid = name.trim().length > 0 && phone.replace(/\D/g, '').length >= 3

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCenterShade}>
          <View style={styles.dialog}>
            <Text style={styles.h2}>{title}</Text>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Campus counseling"
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
            />
            <Text style={styles.fieldLabel}>Phone number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+92 300 0000000"
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
            />
            <View style={styles.modalBottom}>
              <Pressable onPress={onClose}>
                <Text style={styles.link}>Cancel</Text>
              </Pressable>
              <View style={styles.row}>
                {onDelete && initial && (
                  <Pressable onPress={onDelete}>
                    <Text style={[styles.dangerLink, { marginRight: 8 }]}>Remove</Text>
                  </Pressable>
                )}
                <Action disabled={!valid} dark={!valid} onPress={() => onSave({ name: name.trim(), phone: phone.trim() })}>
                  <Text style={[styles.actionText, !valid && { color: '#94A3B8' }]}>Save</Text>
                </Action>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
