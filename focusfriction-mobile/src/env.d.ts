// Expo inlines EXPO_PUBLIC_* variables at bundle time.
declare const process: {
  env: {
    EXPO_PUBLIC_GEMINI_API_KEY?: string
    EXPO_PUBLIC_GEMINI_MODEL?: string
  }
}
