# Google AI Studio Optimizer

Performance optimization userscript for Google AI Studio.

## Features

- Hide old messages
- Reduce DOM lag
- Collapse code blocks
- Restore hidden messages
- Configurable cache system
- Lightweight floating UI

## Installation

### 1. Install Tampermonkey

https://www.tampermonkey.net/

### 2. Install the script

Download:

google-ai-studio-optimizer.user.js

### 3. Open Google AI Studio

https://aistudio.google.com/

---

## Why this script exists

Large conversations in Google AI Studio can become slow because:
- too many DOM nodes,
- huge code blocks,
- continuous rendering.

This userscript reduces lag by:
- hiding old messages,
- purging cached DOM nodes,
- collapsing code automatically.

---

## License

MIT
