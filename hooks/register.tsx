import type { Register, ThemeSetArgs } from 'claude-code'

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
// The scene: a still nebula. The desktop app shows a backdrop as a still
// picture and reloads it on every redraw (a brief black flash), so the scene
// neither animates nor changes after it loads.
// ---------------------------------------------------------------------------

// Seeded so the stars are the same every time.
function makeStars(): string {
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  let out = ''
  for (let i = 0; i < 110; i++) {
    const x = Math.round(rand() * 1600)
    const y = Math.round(rand() * 1000)
    const r = (0.6 + rand() * 1.3).toFixed(2)
    const opacity = (0.25 + rand() * 0.55).toFixed(2)
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#efe6ff" opacity="${opacity}"/>`
  }
  return out
}

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
<style>
  /* Dark only: in light mode the app keeps its own background. */
  @media (prefers-color-scheme: light) { .all { display: none; } }
</style>
<defs>
  <radialGradient id="base" cx="50%" cy="42%" r="78%">
    <stop offset="0" stop-color="#1d1335"/>
    <stop offset="0.55" stop-color="#120c22"/>
    <stop offset="1" stop-color="#07050e"/>
  </radialGradient>
  <radialGradient id="vio"><stop offset="0" stop-color="#6b3ad6" stop-opacity="0.6"/><stop offset="1" stop-color="#6b3ad6" stop-opacity="0"/></radialGradient>
  <radialGradient id="blu"><stop offset="0" stop-color="#3550c8" stop-opacity="0.5"/><stop offset="1" stop-color="#3550c8" stop-opacity="0"/></radialGradient>
  <radialGradient id="mag"><stop offset="0" stop-color="#b23e9e" stop-opacity="0.5"/><stop offset="1" stop-color="#b23e9e" stop-opacity="0"/></radialGradient>
</defs>
<g class="all">
  <rect width="1600" height="1000" fill="url(#base)"/>
  <ellipse cx="400" cy="270" rx="560" ry="360" fill="url(#vio)"/>
  <ellipse cx="1240" cy="320" rx="520" ry="380" fill="url(#blu)"/>
  <ellipse cx="1040" cy="810" rx="600" ry="320" fill="url(#mag)"/>
  <ellipse cx="270" cy="840" rx="420" ry="280" fill="url(#blu)"/>
  ${makeStars()}
</g>
</svg>`

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

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="A violet nebula behind the conversation" />
  })
}
