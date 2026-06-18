# Google AI Studio Optimizer

[![Installer le Script](https://img.shields.io/badge/Tampermonkey-Installer_le_Script-green.svg)](https://raw.githubusercontent.com/Kfayyy/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js)

Improves performance in long Google AI Studio conversations by reducing DOM overload and rendering lag.

## Features

- Hide old messages to instantly reduce DOM lag
- **NEW:** Infinite memory-based message restoration (Zero-lag)
- **NEW:** Flawless ON/OFF Toggle: instantly restores the whole conversation in perfect chronological order without refreshing
- **NEW:** Persistent configuration (automatically saves your settings)
- One-click code block collapsing
- Configurable cache & memory system
- Modern, centered floating UI

## Description

Google AI Studio Optimizer is a lightweight userscript that significantly improves performance in long Google AI Studio conversations by reducing DOM overload and optimizing message rendering.

It limits the number of visible messages, detaches older messages into a lightweight JavaScript memory pool, and adds optional code block collapsing. 

Everything runs locally in your browser. No network requests, no tracking, and no modification of AI responses.

## Key features

* **Reduces lag in long conversations:** Limits rendered chat messages to a configurable amount.
* **Smart Memory Management:** Older messages are safely removed from the DOM to save CPU/RAM, but kept in memory for instant restoration.
* **Persistent Settings:** Your preferences (Max visible, Cache size, etc.) are saved locally and applied automatically on your next visit.
* **Flawless Deactivation:** Disabling the optimizer via the UI seamlessly puts every single message back exactly where it belongs, acting as if the script was never there.
* **Code Collapse:** Collapses code blocks automatically on load, and lets you expand/collapse all visible blocks with a single click.
* **Real-time Counters:** Always know how many messages are safely cached in the background.

## 🎯 Goal

Make long Google AI Studio sessions faster, smoother, and completely lag-free without changing how the AI works.

## Installation

### 1. Install Tampermonkey
https://www.tampermonkey.net/

### 2. Install the script
[![Installer le Script](https://img.shields.io/badge/Tampermonkey-Installer_le_Script-green.svg)](https://raw.githubusercontent.com/Kfayyy/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js)

or Download:
https://raw.githubusercontent.com/Kfayyy/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js

### 3. Open Google AI Studio
https://aistudio.google.com/

---

## Feedback / Issues

If you encounter any problem, please open an issue:
https://github.com/Kfayyy/Google-AI-Studio-Optimizer/issues

---

## Why this script exists

Large conversations in Google AI Studio can become slow because:
- Too many DOM nodes (browser rendering overload),
- Huge code blocks,
- Continuous rendering during token streaming.

This userscript eliminates lag by:
- Hiding old messages visually,
- Completely detaching excessive DOM nodes while keeping them in RAM,
- Collapsing code automatically.

---

## License

MIT

---

## 📖 Usage

After installing the script and opening Google AI Studio, the optimizer starts automatically in the background. No additional setup is required.

The script adds two modern floating buttons at the bottom center of the page:

### ⚡ Optimizer Panel

Click the **🚀** button to open the Optimizer panel. All changes are saved automatically.

Available options:

### **Max visible**

Controls how many messages remain actively visible in the conversation.

Example:
* `35` → only the latest 35 messages remain visible
* Older messages are automatically hidden

Lower values:
* Reduce memory usage & drastically improve performance
* Make scrolling and typing incredibly smooth

Higher values:
* Keep more conversation history visible
* Use more browser resources

---

### **Restore count**

Controls how many hidden messages are brought back each time you click **Restore**.

Example:
* `10` → clicking **Restore** will bring back the latest 10 hidden messages.

Useful when you want to temporarily scroll up and view an older part of the conversation.

---

### **Cache size**

Controls how many hidden messages are kept directly in the DOM (hidden via CSS). 

Example:
* `50` → the latest 50 hidden messages remain in the DOM.
* **The Magic:** Messages that exceed this limit are completely *detached* from the browser's DOM (eliminating lag) but safely stored in the script's memory. You can still restore them anytime without losing your history!

---

### **⚡ Optimizer ON / OFF**

Enables or disables the optimization instantly.

**ON**: The script is active and manages the DOM.

**OFF**: The script instantly reattaches all messages in their **exact chronological order** and restores the default Google AI Studio behavior. It acts exactly as if the script was disabled—no messy UI, no missing messages, and no page refresh needed!

---

### **⬆ Restore (X number of messages)**

Restores hidden messages according to the value defined in **Restore count**.
The button now features a live counter showing exactly how many messages are safely stored in memory (e.g., `⬆ Restore (42 dispo)`).

Example:
If `Restore count = 10`, clicking it will flawlessly bring back the 10 oldest messages from memory into the UI.

---

### **⬇ Clean**

Reapplies the optimization using your current **Max visible** setting.

Example:
If `Max visible = 35`, clicking **Clean** will instantly hide everything except the 35 most recent messages, giving you a fresh and lag-free workspace.

---

### ▼ Code Collapse Button

The **▼** button collapses all currently visible **code blocks** instantly.

This significantly improves performance during heavy coding sessions, as fully expanded code blocks require a massive amount of browser rendering power.
