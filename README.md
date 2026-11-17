# Nebula

Nebula is a dark theme for the Claude desktop and mobile apps. It replaces the flat grey of dark mode with violet-tinted surfaces and a slowly drifting nebula behind the conversation. The background also reacts to what Claude is doing:

- **Thinking:** a soft violet glow breathes in the centre while Claude works.
- **Question pending:** a rose glow rises from the prompt area and pulses until you answer.
- **Turn finished:** a single lilac swell fades away over about three seconds.

Light mode keeps the app's own look. If your system asks for reduced motion, the drifting and twinkling stop.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install nebula --marketplace fenegroni/claude-nebula
```

Answer `y` to add the marketplace, then press Enter to pick the user scope.

From a shell:

```
claude plugin install nebula --marketplace fenegroni/claude-nebula
```

In the desktop app, where `/plugin` does not run, click + next to the prompt box, then Plugins. Choose Add marketplace with `fenegroni/claude-nebula`, then Add plugin.

A mod installed at the user scope loads in every new session, including the desktop app's Code tab.

## Licence

MIT. See [LICENSE](LICENSE).
