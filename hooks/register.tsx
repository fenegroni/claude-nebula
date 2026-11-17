import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs, Timer } from 'claude-code'

import type { Mood, MoodName } from '../types'
import { makeColors } from './make-colors.js'

// ---------------------------------------------------------------------------
// Colours: violet-tinted dark surfaces. Light mode is left as the app's own.
// ---------------------------------------------------------------------------

const { theme, problems } = makeColors({
  label: 'Nebula',
  roles: {
    accent: '#a678f0',
    danger: '#e0566b',
    success: '#4fbf8f',
    warning: '#e0a84a',
    pro: '#e070c8',
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#120d1f',
        'surface-1': '#181226',
        'surface-2': '#1e172e',
        'surface-3': '#211a31',
        'text-primary': '#ede7f8',
        'text-secondary': '#cbc1de',
        'text-muted': '#a598bc',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'nebula', glass: { blur: 22, opacity: 0.55 } },
}

// ---------------------------------------------------------------------------
// State: what Claude is doing, read by the backdrop drawing.
// ---------------------------------------------------------------------------

const mood = atom({ plugin: 'nebula', key: 'mood' } as const, { now: 'idle', was: 'idle' } as Mood, {
  shape: 'mood-1',
})

const DONE_GLOW_MS = 4000
let backToIdle: Timer | undefined

function setMood($: EngineInterface, next: MoodName) {
  return update($, mood, m => (m.now === next ? m : { now: next, was: m.now }))
}

// ---------------------------------------------------------------------------
// The scene: a still star field and slow-drifting nebula clouds, plus three
// glow layers that switch on with the mood.
// ---------------------------------------------------------------------------

// Seeded so the stars stay put across redraws.
function stars(): string {
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  let out = ''
  for (let i = 0; i < 90; i++) {
    const x = Math.round(rand() * 1600)
    const y = Math.round(rand() * 1000)
    const r = (0.5 + rand() * 1.1).toFixed(2)
    out += `<circle class="s s${i % 3}" cx="${x}" cy="${y}" r="${r}"/>`
  }
  return out
}
const STARS = stars()

// Drift periods in seconds. The delays are set from the clock so a redraw
// picks the motion up where it was instead of jumping back to the start.
const DRIFT = { a: 70, b: 85, c: 95, d: 60 }

function scene(m: Mood, nowMs: number): string {
  const t = nowMs / 1000
  const delay = (period: number) => `-${(t % (period * 2)).toFixed(2)}s`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" class="m-${m.now} w-${m.was}">
<style>
  .neb { transform-box: fill-box; transform-origin: center; animation: drift ease-in-out infinite alternate; }
  .a { animation-duration: ${DRIFT.a}s; animation-delay: ${delay(DRIFT.a)}; }
  .b { animation-duration: ${DRIFT.b}s; animation-delay: ${delay(DRIFT.b)}; animation-name: drift2; }
  .c { animation-duration: ${DRIFT.c}s; animation-delay: ${delay(DRIFT.c)}; }
  .d { animation-duration: ${DRIFT.d}s; animation-delay: ${delay(DRIFT.d)}; animation-name: drift2; }
  @keyframes drift  { from { transform: translate(-40px, -18px) scale(1); }    to { transform: translate(46px, 24px) scale(1.07); } }
  @keyframes drift2 { from { transform: translate(36px, 20px) scale(1.05); }  to { transform: translate(-42px, -22px) scale(0.97); } }

  .s { fill: #e9defc; opacity: 0.55; animation: twinkle 6s ease-in-out infinite; }
  .s1 { animation-duration: 8.5s; animation-delay: -3s; }
  .s2 { animation-duration: 11s; animation-delay: -7s; opacity: 0.35; }
  @keyframes twinkle { 50% { opacity: 0.12; } }

  .think, .ask, .done { opacity: 0; }

  /* The glow of the mood just left fades out. */
  .w-thinking .think { animation: out-think 1.6s ease-out both; }
  .w-question .ask   { animation: out-ask 1.6s ease-out both; }
  @keyframes out-think { from { opacity: 0.42; } to { opacity: 0; } }
  @keyframes out-ask   { from { opacity: 0.6; }  to { opacity: 0; } }

  /* Thinking: a soft violet core that breathes. */
  .m-thinking .think { animation: in-think 1.4s ease-out both, breathe 4s ease-in-out 1.4s infinite; }
  @keyframes in-think { from { opacity: 0; } to { opacity: 0.42; } }
  @keyframes breathe  { 0%, 100% { opacity: 0.42; } 50% { opacity: 0.16; } }

  /* Question pending: a rose glow rises from the prompt and pulses. */
  .m-question .ask { animation: in-ask 1s ease-out both, pulse 2.6s ease-in-out 1s infinite; }
  @keyframes in-ask { from { opacity: 0; } to { opacity: 0.6; } }
  @keyframes pulse  { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.22; } }

  /* Turn finished: one lilac swell that fades away. */
  .m-done .done { animation: flash 3.2s ease-out both; }
  @keyframes flash { 0% { opacity: 0; } 18% { opacity: 0.38; } 100% { opacity: 0; } }

  @media (prefers-reduced-motion: reduce) {
    .neb, .s { animation: none; }
  }
  /* Dark only: in light mode the app keeps its own background. */
  @media (prefers-color-scheme: light) {
    .all { display: none; }
  }
</style>
<defs>
  <radialGradient id="base" cx="50%" cy="42%" r="78%">
    <stop offset="0" stop-color="#1d1335"/>
    <stop offset="0.55" stop-color="#120c22"/>
    <stop offset="1" stop-color="#07050e"/>
  </radialGradient>
  <radialGradient id="vio"><stop offset="0" stop-color="#6b3ad6" stop-opacity="0.55"/><stop offset="1" stop-color="#6b3ad6" stop-opacity="0"/></radialGradient>
  <radialGradient id="blu"><stop offset="0" stop-color="#3550c8" stop-opacity="0.45"/><stop offset="1" stop-color="#3550c8" stop-opacity="0"/></radialGradient>
  <radialGradient id="mag"><stop offset="0" stop-color="#b23e9e" stop-opacity="0.45"/><stop offset="1" stop-color="#b23e9e" stop-opacity="0"/></radialGradient>
  <radialGradient id="core"><stop offset="0" stop-color="#a387ff"/><stop offset="0.6" stop-color="#7a52e0" stop-opacity="0.35"/><stop offset="1" stop-color="#7a52e0" stop-opacity="0"/></radialGradient>
  <radialGradient id="rose"><stop offset="0" stop-color="#f28aaa"/><stop offset="0.55" stop-color="#d0567f" stop-opacity="0.35"/><stop offset="1" stop-color="#d0567f" stop-opacity="0"/></radialGradient>
  <radialGradient id="lilac"><stop offset="0" stop-color="#d8c8ff"/><stop offset="1" stop-color="#9b7cf0" stop-opacity="0"/></radialGradient>
</defs>
<g class="all">
  <rect width="1600" height="1000" fill="url(#base)"/>
  <ellipse class="neb a" cx="360" cy="250" rx="540" ry="340" fill="url(#vio)"/>
  <ellipse class="neb b" cx="1270" cy="300" rx="500" ry="370" fill="url(#blu)"/>
  <ellipse class="neb c" cx="1060" cy="830" rx="580" ry="300" fill="url(#mag)"/>
  <ellipse class="neb d" cx="230" cy="860" rx="400" ry="260" fill="url(#blu)"/>
  ${STARS}
  <ellipse class="think" cx="800" cy="470" rx="720" ry="470" fill="url(#core)"/>
  <ellipse class="ask" cx="800" cy="1040" rx="980" ry="440" fill="url(#rose)"/>
  <ellipse class="done" cx="800" cy="500" rx="1000" ry="640" fill="url(#lilac)"/>
</g>
</svg>`
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)
    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }
    await update($, mood, (): Mood => ({ now: 'idle', was: 'idle' }))

    return next(e)
  })

  // Main loop only: subagents starting and finishing should not flicker the sky.
  on('turn.start', async ($, e, next) => {
    if (e.agentId === undefined) {
      backToIdle?.cancel()
      await setMood($, 'thinking')
    }

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId === undefined) {
      await setMood($, 'done')
      backToIdle?.cancel()
      backToIdle = $.clock.after(DONE_GLOW_MS, () => {
        void update($, mood, (m): Mood => (m.now === 'done' ? { now: 'idle', was: 'done' } : m))
      })
    }

    return result
  })

  // The question dialog stays open until it is answered; the turn then goes on.
  on('tool.call', { tool: 'AskUserQuestion' }, async ($, e, next) => {
    await setMood($, 'question')
    const result = await next(e)
    await setMood($, 'thinking')

    return result
  }).catch(($, e, next) => next(e)) // A failure here must never block the question.

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const m = await read($, mood)
    const now = await $.clock.now()

    return (
      <Svg
        source={scene(m, now)}
        alt="A violet nebula drifting slowly behind the conversation"
        isInteractive
      />
    )
  })
}
