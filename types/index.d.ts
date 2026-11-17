export type MoodName = 'idle' | 'thinking' | 'question' | 'done'

/** What Claude is doing, which picks the backdrop's glow. */
export type Mood = { now: MoodName }

declare module 'claude-code' {
  interface PluginState {
    nebula: { mood: Shaped<Mood> }
  }
}
