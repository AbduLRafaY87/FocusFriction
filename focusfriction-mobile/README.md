# FocusFriction CS — mobile (Expo)

All data is stored **on the device** (AsyncStorage). Nothing is sent anywhere except the task text you type into
"Deconstruct this task", which goes to the Gemini API.

## Run

```bash
cd mobile
npm install            # .npmrc enables legacy-peer-deps (lucide-react-native still declares React <= 18)
cp .env.example .env.local   # then paste your Gemini key
npx expo start
```

`.env.local` is git-ignored. Without a key the app still works and falls back to a basic 4-step breakdown.

> `EXPO_PUBLIC_*` values are bundled into the app binary, so anyone with the build can extract the key. Fine for a
> prototype; for a real release, restrict the key in Google Cloud and/or proxy the call through a backend.

## What's stored (key `focusfriction:data:v1`)

Tasks + steps, 15-min sprints, mood check-ins, friction-gate completions (with reflections), skill journal,
support/emergency contacts, bedtime state, settings. "Erase all data" in the avatar menu wipes it.

## Features (from the Q3 report)

| Idea | Status |
|---|---|
| 2 Physical step-counter lock | Walk 200 steps (needs a real device; Expo Go works) |
| 3 15-minute task chunker | Gemini breakdown + pinned "Start 15-min task" on Home |
| 4 Post-scroll mood logger | Saved after each sprint |
| 5 Bedtime mode | Gentle mode + daily wind-down checklist (OS-level grayscale / feed blocking is not possible from Expo) |
| 9 Skill Progress Journal | New tab, with pre-filled templates |
| 10 Human SOS | Contacts you add + two-step "Are you sure you want to connect?" before dialing |
| Dual-friction (tester P1) | Settings -> Strict friction: reflection AND 200 steps |
| Contact whitelist (tester P5) | Night tab -> Emergency contacts (+ shortcut to phone DND settings) |
| 1 Peer-verification lock | Not built: needs a backend to pair two phones |
