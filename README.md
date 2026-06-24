# Google AI Studio Optimizer

[![Installer le Script](https://img.shields.io/badge/Tampermonkey-Installer_le_Script-green.svg)](https://raw.githubusercontent.com/Kfayyy/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js)

Improves performance in long Google AI Studio conversations by reducing DOM overload, rendering lag, and adding advanced export capabilities.

## Features

* Hide old messages to instantly reduce DOM lag
* Infinite memory-based message restoration (Zero-lag)
* Flawless ON/OFF Toggle with full conversation restoration
* Persistent configuration (automatically saves your settings)
* One-click code block collapsing
* Configurable cache & memory system
* **NEW:** Automatic conversation export (Markdown or JSON)
* **NEW:** Full auto-scroll conversation scanner
* **NEW:** System Prompt export support
* **NEW:** Gemini Thoughts export support
* **NEW:** Emoji removal mode for clean datasets
* Modern, centered floating UI

## Description

Google AI Studio Optimizer is a lightweight userscript that significantly improves performance in long Google AI Studio conversations by reducing DOM overload, optimizing message rendering, and providing advanced conversation export tools.

It limits the number of visible messages, detaches older messages into a lightweight JavaScript memory pool, automatically collapses code blocks, and allows complete conversation exports in Markdown or JSON format.

Everything runs locally in your browser. No network requests, no tracking, and no modification of AI responses.

## Key features

* **Reduces lag in long conversations:** Limits rendered chat messages to a configurable amount.
* **Smart Memory Management:** Older messages are safely removed from the DOM to save CPU/RAM, but kept in memory for instant restoration.
* **Persistent Settings:** Your preferences are automatically saved and restored.
* **Flawless Deactivation:** Disabling the optimizer instantly restores the entire conversation exactly as Google AI Studio originally displayed it.
* **Code Collapse:** Automatically collapses code blocks and allows one-click collapsing.
* **Conversation Export:** Export entire conversations as Markdown or JSON files.
* **System Prompt Detection:** Captures and exports system instructions when available.
* **Gemini Thoughts Export:** Optionally includes Gemini reasoning blocks in exports.
* **Emoji Removal Mode:** Produces clean datasets suitable for fine-tuning or external processing.
* **Automatic Full Scan:** Scans lazy-loaded conversations to export complete histories.
* **Real-time Counters:** Always know how many messages are currently stored in memory.

## Goal

Make long Google AI Studio sessions faster, smoother, exportable, and completely lag-free without changing how the AI works.

## Installation

### 1. Install Tampermonkey

[https://www.tampermonkey.net/](https://www.tampermonkey.net/)

### 2. Install the script

Click the big green Install button 

or click [![Installer le Script](https://img.shields.io/badge/Tampermonkey-Installer_le_Script-green.svg)](https://raw.githubusercontent.com/Kfayyy/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js)

or Download:
[https://raw.githubusercontent.com/Kfayyy/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js](https://raw.githubusercontent.com/Kfayyy/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js)

### 3. Open Google AI Studio

[https://aistudio.google.com/](https://aistudio.google.com/)

---

## Feedback / Issues

If you encounter any problem, please open an issue:
[https://github.com/Kfayyy/Google-AI-Studio-Optimizer/issues](https://github.com/Kfayyy/Google-AI-Studio-Optimizer/issues)

Or post a comment on GreasyFork:
[https://greasyfork.org/fr/scripts/578144-google-ai-studio-ultimate-optimizer-ui/feedback](https://greasyfork.org/fr/scripts/578144-google-ai-studio-ultimate-optimizer-ui/feedback)

---

## Why this script exists

Large conversations in Google AI Studio can become slow because:

* Too many DOM nodes (browser rendering overload)
* Huge code blocks
* Continuous rendering during token streaming
* Lazy-loaded conversation history
* Missing native export options

This userscript eliminates lag by:

* Hiding old messages visually
* Completely detaching excessive DOM nodes while keeping them in RAM
* Collapsing code automatically
* Restoring messages instantly
* Exporting entire conversations locally

Then, it grows up with export funtion and more to come !

---

## Usage

After installing the script and opening Google AI Studio, the optimizer starts automatically in the background. No additional setup is required.

The script adds two modern floating buttons at the bottom center of the page:

### Optimizer Panel

Click the **🚀** button to open the Optimizer panel. All changes are saved automatically.

Available options:

### **Max visible**

Controls how many messages remain actively visible in the conversation.

Example:

* `35` → only the latest 35 messages remain visible.
* Older messages are automatically hidden.

Lower values:

* Reduce memory usage.
* Drastically improve performance.
* Make scrolling and typing smoother.

Higher values:

* Keep more conversation history visible.
* Use more browser resources.

---

### **Restore count**

Controls how many hidden messages are brought back each time you click **Restore**.

Example:

* `10` → clicking **Restore** brings back the latest 10 hidden messages.

Useful when you want to temporarily browse older sections of the conversation.

---

### **Cache size**

Controls how many hidden messages remain inside the DOM.

Example:

* `50` → the latest 50 hidden messages stay hidden via CSS.
* Older messages are fully detached from the DOM and stored in memory.

This provides maximum performance while preserving the complete conversation.

---

### ** Optimizer ON / OFF**

Enables or disables the optimizer instantly.

**ON:** The script actively manages the conversation DOM.

**OFF:** Every message is restored in its exact chronological order without refreshing the page.

---

### **⬆ Restore (X messages)**

Restores hidden messages according to the value defined in **Restore count**.

The button displays a live counter showing how many messages are currently stored in memory.

Example:

`⬆ Restore (42 dispo)`

---

### **⬇ Reset to Max**

Reapplies the optimization using the current **Max visible** value.

Example:

If `Max visible = 35`, the script immediately hides older messages and restores a smooth workspace.

---

### Code Collapse Button

The **▼** button collapses all currently visible code blocks.

Large code blocks can significantly impact browser rendering performance during long coding sessions.

---

## Export System

The optimizer includes a full conversation export engine.

### Supported formats

* Markdown (.md)
* JSON (.json)

### Export options

* Include Gemini Thoughts
* Include System Instructions
* Remove emojis (strict mode)
* Automatic lazy-loading scanner
* Full conversation reconstruction

### Auto-Scan Export

The export scanner automatically:

1. Restores hidden messages.
2. Scrolls through the entire conversation.
3. Captures every turn.
4. Detects Gemini Thoughts.
5. Detects System Instructions.
6. Generates the export file.

Everything happens locally in your browser.

---

**Version:** 5.17
**License:** MIT
