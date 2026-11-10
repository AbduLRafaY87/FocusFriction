import { Alert, Linking } from 'react-native'

/** Two-step confirmation so nobody pings a counselor or contact by accident. */
export function confirmCall(name: string, phone: string) {
  Alert.alert(`Connect with ${name}?`, 'Are you sure you want to connect? This will open your phone dialer.', [
    { text: 'Not now', style: 'cancel' },
    {
      text: 'Yes, connect',
      onPress: () =>
        Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`).catch(() =>
          Alert.alert('Could not open the dialer', 'Please dial the number manually.'),
        ),
    },
  ])
}
