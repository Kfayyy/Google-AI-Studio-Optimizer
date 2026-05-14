# Google AI Studio Optimizer

Performance optimization userscript for Google AI Studio.

## Features

- Hide old messages
- Reduce DOM lag
- Collapse code blocks
- Restore hidden messages
- Configurable cache system
- Lightweight floating UI

## Description

Google AI Studio Optimizer is a lightweight userscript that improves performance in long Google AI Studio conversations by reducing DOM overload and optimizing message rendering.

It limits the number of visible messages, adds optional code block collapsing, and manages cached content during extended sessions.

Everything runs locally in your browser. No network requests, no tracking, and no modification of AI responses.

## Key features

* Reduces lag in long conversations
* Limits rendered chat messages (you can configure how many messages are loaded)
* Collapses code blocks automatically (expand/collapse all visible blocks with a button)
* Lightweight caching system (configurable cache size)
* Optional DOM cleanup for improved performance
* Simple floating control panel

## 🎯 Goal

Make long Google AI Studio sessions faster and more responsive without changing how the AI works.

## Installation

### 1. Install Tampermonkey
https://www.tampermonkey.net/

### 2. Install the script
Download:
google-ai-studio-optimizer.user.js

### 3. Open Google AI Studio
https://aistudio.google.com/

---

## Feedback / Issues

If you encounter any problem, please open an issue:
https://github.com/Kfayyy/Google-AI-Studio-Optimizer/issues

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
