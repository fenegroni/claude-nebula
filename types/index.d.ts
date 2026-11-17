export type MoodName = 'idle' | 'thinking' | 'question' | 'done'

/** The backdrop's state now, and the one it left, so the old glow can fade out. */
export type Mood = { now: MoodName; was: MoodName }

declare module 'claude-code' {
  interface PluginState {
    nebula: { mood: Shaped<Mood> }
  }
}
