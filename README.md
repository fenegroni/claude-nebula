# Nebula

Nebula is a dark theme for the Claude desktop and mobile apps. It replaces the flat grey of dark mode with violet-tinted surfaces and a nebula of violet, blue and magenta clouds with stars behind the conversation.

Light mode keeps the app's own look.

The background is still and never changes after it loads. The desktop app currently shows a theme's background as a still picture: it runs no animation inside it, and it reloads the picture with a brief black flash whenever the background changes.

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
